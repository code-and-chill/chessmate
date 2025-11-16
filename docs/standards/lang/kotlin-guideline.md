# Kotlin Service Architecture Guidelines (Monocto)

This document defines the architectural principles and implementation patterns for JVM services in the **monocto** monorepo. It complements the root-level guidelines in [`AGENTS.md`](../AGENTS.md) and serves as the definitive guide for Domain-Driven Design implementation in Kotlin services.

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Domain-Driven Design Principles](#2-domain-driven-design-principles)
3. [Bounded Context Organization](#3-bounded-context-organization)
4. [Domain Modeling Patterns](#4-domain-modeling-patterns)
5. [Application Architecture Layers](#5-application-architecture-layers)
6. [Integration and Communication Patterns](#6-integration-and-communication-patterns)
7. [Testing Strategies](#7-testing-strategies)
8. [Build System and Tooling](#8-build-system-and-tooling)
9. [Implementation Guidelines](#9-implementation-guidelines)
10. [Examples and References](#10-examples-and-references)

---

## 1. Architecture Philosophy

### 1.1 Core Principles

Our Kotlin services follow **Domain-Driven Design (DDD)** principles with these foundational concepts:

- **Domain-First Organization**: Code is organized by business capabilities, not technical layers
- **Bounded Context Isolation**: Each business domain is self-contained with clear boundaries
- **Rich Domain Models**: Business logic lives in domain entities and services, not in controllers or repositories
- **Explicit Architecture**: Dependencies flow inward toward the domain, with infrastructure adapting to domain needs
- **Event-Driven Integration**: Bounded contexts communicate through domain events, not direct coupling

### 1.2 Service Types and Responsibilities

Services are categorized by their role in the system:

- **`*-api`**: External HTTP interfaces (mobile/web BFFs, partner APIs)
- **`*-service`**: Internal synchronous services consumed by other backends
- **`*-worker`**: Asynchronous/background processing and CLI tools
- **`*-engine`**: Specialized compute layers (pricing, routing, recommendations)

### 1.3 Quality Attributes

All services must exhibit:

- **Maintainability**: Clear domain boundaries and separation of concerns
- **Testability**: Domain logic isolated from infrastructure dependencies
- **Scalability**: Stateless design with proper aggregate boundaries
- **Observability**: Comprehensive tracing, metrics, and structured logging
- **Resilience**: Circuit breakers, timeouts, and graceful degradation

### 1.4 Code Quality Principles

**SOLID Principles (Non-Negotiable)**
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

**Self-Documenting Code**
- Code must be self-explanatory without inline comments
- Use intention-revealing names for classes, methods, and variables
- Extract complex logic into well-named private methods
- Prefer small, focused methods over large, commented ones
- If you need a comment to explain what code does, refactor instead

**Scalability-First Mindset**
- Build for scale from day one - no "temporary" solutions
- Choose proper abstractions over quick fixes
- Consider future maintenance cost in every design decision
- Prefer composition over inheritance for flexibility

---

## 2. Domain-Driven Design Principles

### 2.1 Ubiquitous Language

Each bounded context develops its own **ubiquitous language** - a shared vocabulary between domain experts and developers:

- Domain concepts are expressed in code using the same terms used by business stakeholders
- Class names, method names, and package names reflect business terminology
- Technical jargon is avoided in domain models
- Language consistency is maintained across all artifacts (code, tests, documentation)

### 2.2 Bounded Context Definition

A **bounded context** is a logical boundary within which a domain model is defined and applicable:

**Identification Criteria:**
- Represents a distinct business capability
- Has clear ownership and responsibility
- Can evolve independently
- Has its own data model and business rules
- Communicates with other contexts through well-defined interfaces

**Example Bounded Contexts in IAM Service:**
- **Identity**: Core user identity and profile management
- **Authentication**: Login flows, sessions, and credential verification
- **Authorization**: Access control, roles, permissions, and tokens
- **MFA**: Multi-factor authentication enrollment and verification
- **Federation**: SSO, SAML, OAuth, and external identity providers
- **Tenant**: Multi-tenancy configuration and isolation

### 2.3 Strategic Design Patterns

**Context Mapping Patterns:**
- **Shared Kernel**: Common domain concepts shared across contexts (value objects, events)
- **Customer-Supplier**: One context depends on another with well-defined contracts
- **Conformist**: Downstream context conforms to upstream context's model
- **Anti-Corruption Layer**: Protect domain model from external system complexity

---

## 3. Bounded Context Organization

### 3.1 Package Structure

Each bounded context follows a consistent package structure:

```
/service-name/src/main/kotlin/com/monocto/service/
├── contextname/                 # Business domain (e.g., authentication, authorization)
│   ├── domain/                 # Domain entities, value objects, domain services
│   ├── service/               # Application services and domain services
│   ├── repository/            # Repository interfaces and implementations
│   ├── controller/            # REST controllers and API endpoints
│   └── client/               # Request/Response DTOs
├── shared/                    # Shared kernel components
│   ├── domain/               # Shared value objects, events, base classes
│   ├── service/             # Cross-cutting infrastructure services
│   └── infrastructure/      # Shared infrastructure components
└── infrastructure/           # Technical infrastructure (config, security, etc.)
```

### 3.2 Context Boundaries and Dependencies

**Dependency Rules:**
- Contexts may depend on the **shared kernel**
- Contexts may depend on **infrastructure services**
- Contexts **must not** directly depend on other contexts
- Cross-context communication happens through **domain events** or **application services**

**Allowed Dependencies:**
```kotlin
// ✅ CORRECT: Interface-based communication
interface UserOperations {
    fun findUserById(userId: UserId): User?
    fun createUser(request: CreateUserRequest): User
}

@Service
class AuthenticationService(
    private val userOperations: UserOperations  // Interface, not direct service
) {
    // Implementation
}
```

**Prohibited Dependencies:**
```kotlin
// ❌ WRONG: Direct cross-context dependencies
@Service
class AuthenticationService(
    private val identityService: IdentityService  // Direct service dependency
) {
    // This creates tight coupling between contexts
}
```

### 3.3 File Organization Rules

**Strict One-Class-Per-File Rule:**
- Each Kotlin file MUST contain exactly one top-level class, interface, or data class
- File name MUST match the class name exactly (e.g., `User.kt` contains `class User`)
- No exceptions for "related" classes - use package structure for organization

**Examples:**
```kotlin
// ❌ WRONG: Multiple classes in one file
// File: UserDtos.kt
data class CreateUserRequest(val name: String, val email: String)
data class UpdateUserRequest(val name: String?)
data class UserResponse(val id: String, val name: String, val email: String)

// ✅ CORRECT: Separate files
// File: CreateUserRequest.kt
data class CreateUserRequest(val name: String, val email: String)

// File: UpdateUserRequest.kt  
data class UpdateUserRequest(val name: String?)

// File: UserResponse.kt
data class UserResponse(val id: String, val name: String, val email: String)
```

---

## 4. Domain Modeling Patterns

### 4.1 Aggregate Design

**Aggregate Root Pattern:**
```kotlin
abstract class AggregateRoot<T> {
    private val _domainEvents = mutableListOf<DomainEvent>()
    
    abstract val id: T
    val domainEvents: List<DomainEvent> get() = _domainEvents.toList()
    
    protected fun raiseEvent(event: DomainEvent) {
        _domainEvents.add(event)
    }
    
    fun clearEvents() {
        _domainEvents.clear()
    }
}
```

**Aggregate Design Rules:**
- One aggregate root per aggregate
- External references only to aggregate roots, never to internal entities
- Aggregate boundaries define consistency boundaries
- Keep aggregates small and focused on a single business concept
- Use eventual consistency between aggregates

**Example Aggregate:**
```kotlin
class User private constructor(
    override val id: UserId,
    private var profile: UserProfile,
    private var credentials: UserCredentials,
    private var status: UserStatus
) : AggregateRoot<UserId>() {
    
    companion object {
        fun create(
            id: UserId,
            email: Email,
            displayName: String,
            tenantId: TenantId
        ): User {
            val user = User(
                id = id,
                profile = UserProfile.create(email, displayName),
                credentials = UserCredentials.empty(),
                status = UserStatus.ACTIVE
            )
            user.raiseEvent(UserCreatedEvent(id, tenantId, email, displayName))
            return user
        }
    }
    
    fun updateProfile(newProfile: UserProfile): User {
        val oldProfile = this.profile
        this.profile = newProfile
        raiseEvent(UserProfileUpdatedEvent(id, oldProfile, newProfile))
        return this
    }
    
    fun changePassword(newPassword: HashedPassword): User {
        this.credentials = credentials.withPassword(newPassword)
        raiseEvent(UserPasswordChangedEvent(id))
        return this
    }
    
    // Expose read-only access to internal state
    val email: Email get() = profile.email
    val displayName: String get() = profile.displayName
    val isActive: Boolean get() = status == UserStatus.ACTIVE
}
```

### 4.2 Value Objects

**Value Object Characteristics:**
- Immutable
- Equality based on value, not identity
- No side effects
- Self-validating

**Example Value Objects:**
```kotlin
@JvmInline
value class UserId(val value: String) {
    init {
        require(value.isNotBlank()) { "UserId cannot be blank" }
        require(value.length <= 255) { "UserId cannot exceed 255 characters" }
    }
    
    companion object {
        fun generate(): UserId = UserId(UUID.randomUUID().toString())
        fun fromString(value: String): UserId = UserId(value)
    }
}

@JvmInline
value class Email(val value: String) {
    init {
        require(value.matches(EMAIL_REGEX)) { "Invalid email format: $value" }
    }
    
    companion object {
        private val EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
    }
}

data class UserProfile(
    val email: Email,
    val displayName: String,
    val firstName: String?,
    val lastName: String?,
    val phoneNumber: PhoneNumber?
) {
    init {
        require(displayName.isNotBlank()) { "Display name cannot be blank" }
        require(displayName.length <= 100) { "Display name cannot exceed 100 characters" }
    }
    
    companion object {
        fun create(email: Email, displayName: String): UserProfile {
            return UserProfile(
                email = email,
                displayName = displayName,
                firstName = null,
                lastName = null,
                phoneNumber = null
            )
        }
    }
}
```

### 4.3 Domain Services

**When to Use Domain Services:**
- Business logic that doesn't naturally belong to any single entity
- Operations that involve multiple aggregates
- Complex business rules that require external dependencies
- Stateless operations that implement domain concepts

**Example Domain Service (Self-Documenting):**
```kotlin
interface PasswordPolicyService {
    fun validatePassword(password: String, userId: UserId): PasswordValidationResult
    fun generateTemporaryPassword(): String
}

@Service
class DefaultPasswordPolicyService(
    private val passwordHistoryRepository: PasswordHistoryRepository,
    private val tenantConfigurationService: TenantConfigurationService
) : PasswordPolicyService {
    
    override fun validatePassword(password: String, userId: UserId): PasswordValidationResult {
        val policy = tenantConfigurationService.getPasswordPolicy(userId.tenantId)
        val violations = mutableListOf<String>()
        
        violations.addAll(validatePasswordLength(password, policy))
        violations.addAll(validatePasswordComplexity(password, policy))
        violations.addAll(validatePasswordHistory(password, userId, policy))
        
        return createValidationResult(violations)
    }
    
    private fun validatePasswordLength(password: String, policy: PasswordPolicy): List<String> {
        return if (password.length < policy.minLength) {
            listOf("Password must be at least ${policy.minLength} characters")
        } else {
            emptyList()
        }
    }
    
    private fun validatePasswordComplexity(password: String, policy: PasswordPolicy): List<String> {
        val violations = mutableListOf<String>()
        
        if (policy.requireUppercase && !password.containsUppercaseCharacter()) {
            violations.add("Password must contain at least one uppercase letter")
        }
        
        if (policy.requireLowercase && !password.containsLowercaseCharacter()) {
            violations.add("Password must contain at least one lowercase letter")
        }
        
        if (policy.requireDigits && !password.containsDigit()) {
            violations.add("Password must contain at least one digit")
        }
        
        return violations
    }
    
    private fun validatePasswordHistory(password: String, userId: UserId, policy: PasswordPolicy): List<String> {
        if (!policy.preventReuse) return emptyList()
        
        val recentPasswords = passwordHistoryRepository.getRecentPasswords(userId, policy.historyCount)
        return if (recentPasswords.any { it.matches(password) }) {
            listOf("Password cannot be one of the last ${policy.historyCount} passwords")
        } else {
            emptyList()
        }
    }
    
    private fun createValidationResult(violations: List<String>): PasswordValidationResult {
        return if (violations.isEmpty()) {
            PasswordValidationResult.valid()
        } else {
            PasswordValidationResult.invalid(violations)
        }
    }
}

// Extension functions for better readability
private fun String.containsUppercaseCharacter(): Boolean = any { it.isUpperCase() }
private fun String.containsLowercaseCharacter(): Boolean = any { it.isLowerCase() }
private fun String.containsDigit(): Boolean = any { it.isDigit() }
```

### 4.4 Domain Events

**Event Design Principles:**
- Events represent something that happened in the past (past tense naming)
- Events are immutable
- Events contain all necessary data for consumers
- Events have a clear business meaning

**Base Event Infrastructure:**
```kotlin
interface DomainEvent {
    val eventId: String
    val occurredAt: Instant
    val aggregateId: String
    val eventType: String
    val version: Int
}

abstract class BaseDomainEvent(
    override val eventId: String,
    override val occurredAt: Instant,
    override val aggregateId: String,
    override val eventType: String,
    override val version: Int
) : DomainEvent

// Context-specific event interfaces
interface UserDomainEvent : DomainEvent {
    val userId: UserId
}

interface AuthenticationDomainEvent : DomainEvent {
    val userId: UserId
    val sessionId: SessionId?
}
```

**Example Domain Events:**
```kotlin
data class UserCreatedEvent(
    override val userId: UserId,
    val tenantId: TenantId,
    val email: Email,
    val displayName: String,
    override val aggregateId: String = userId.value,
    override val eventId: String = UUID.randomUUID().toString(),
    override val occurredAt: Instant = Instant.now(),
    override val eventType: String = "UserCreated",
    override val version: Int = 1
) : BaseDomainEvent(eventId, occurredAt, aggregateId, eventType, version), UserDomainEvent

data class UserAuthenticatedEvent(
    override val userId: UserId,
    override val sessionId: SessionId,
    val tenantId: TenantId,
    val authenticationMethod: String,
    val ipAddress: String?,
    val userAgent: String?,
    override val aggregateId: String = sessionId.value,
    override val eventId: String = UUID.randomUUID().toString(),
    override val occurredAt: Instant = Instant.now(),
    override val eventType: String = "UserAuthenticated",
    override val version: Int = 1
) : BaseDomainEvent(eventId, occurredAt, aggregateId, eventType, version), AuthenticationDomainEvent
```

### 4.5 Complex Business Rules Modeling

**Specification Pattern for Complex Rules:**
```kotlin
interface Specification<T> {
    fun isSatisfiedBy(candidate: T): Boolean
    fun and(other: Specification<T>): Specification<T> = AndSpecification(this, other)
    fun or(other: Specification<T>): Specification<T> = OrSpecification(this, other)
    fun not(): Specification<T> = NotSpecification(this)
}

class UserCanAuthenticateSpecification(
    private val tenantId: TenantId,
    private val currentTime: Instant = Instant.now()
) : Specification<User> {
    
    override fun isSatisfiedBy(user: User): Boolean {
        return user.isActive &&
               !user.isLocked &&
               !user.isExpired(currentTime) &&
               user.belongsToTenant(tenantId)
    }
}

class AuthenticationAttemptSpecification(
    private val maxFailedAttempts: Int,
    private val lockoutDuration: Duration
) : Specification<AuthenticationHistory> {
    
    override fun isSatisfiedBy(history: AuthenticationHistory): Boolean {
        val recentFailures = history.getRecentFailures(lockoutDuration)
        return recentFailures.size < maxFailedAttempts
    }
}

// Usage in domain service
@Service
class AuthenticationDomainService(
    private val userRepository: UserRepository,
    private val authHistoryRepository: AuthenticationHistoryRepository
) {
    
    fun canUserAuthenticate(userId: UserId, tenantId: TenantId): Boolean {
        val user = userRepository.findById(userId) ?: return false
        val history = authHistoryRepository.findByUserId(userId)
        
        val userSpec = UserCanAuthenticateSpecification(tenantId)
        val attemptSpec = AuthenticationAttemptSpecification(
            maxFailedAttempts = 5,
            lockoutDuration = Duration.ofMinutes(15)
        )
        
        return userSpec.isSatisfiedBy(user) && attemptSpec.isSatisfiedBy(history)
    }
}
```

### 4.6 Event Sourcing Patterns

**Event Store Interface:**
```kotlin
interface EventStore {
    fun saveEvents(aggregateId: String, events: List<DomainEvent>, expectedVersion: Int)
    fun getEvents(aggregateId: String): List<DomainEvent>
    fun getEvents(aggregateId: String, fromVersion: Int): List<DomainEvent>
}

// Event-sourced aggregate
abstract class EventSourcedAggregateRoot<T> {
    abstract val id: T
    private var version: Int = 0
    private val uncommittedEvents = mutableListOf<DomainEvent>()
    
    protected fun applyEvent(event: DomainEvent) {
        applyChange(event, true)
    }
    
    private fun applyChange(event: DomainEvent, isNew: Boolean) {
        // Apply the event to the aggregate state
        handle(event)
        
        if (isNew) {
            uncommittedEvents.add(event)
        }
        version++
    }
    
    protected abstract fun handle(event: DomainEvent)
    
    fun getUncommittedEvents(): List<DomainEvent> = uncommittedEvents.toList()
    
    fun markEventsAsCommitted() {
        uncommittedEvents.clear()
    }
    
    fun loadFromHistory(events: List<DomainEvent>) {
        events.forEach { event ->
            applyChange(event, false)
        }
    }
}
```

---

## 5. Application Architecture Layers

### 5.1 Layer Responsibilities

**Controller Layer (Presentation):**
- Handle HTTP-specific concerns only
- Input validation and format checking
- Request/response transformation
- Error mapping to HTTP status codes
- No business logic

**Application Service Layer:**
- Orchestrate use cases and business workflows
- Coordinate between multiple aggregates
- Handle cross-cutting concerns (transactions, security, logging)
- Publish domain events
- No business rules (delegate to domain)

**Domain Layer:**
- Contain all business logic and rules
- Maintain data consistency and invariants
- Implement business workflows within aggregates
- Raise domain events
- No infrastructure dependencies

**Infrastructure Layer:**
- Implement repository interfaces
- Handle external system integration
- Provide technical services (caching, messaging, etc.)
- Adapt external formats to domain models

### 5.2 Controller Implementation

**RESTful API Design:**
```kotlin
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User lifecycle operations")
class UserController(
    private val userApplicationService: UserApplicationService
) {
    
    @PostMapping
    @Operation(summary = "Create new user", description = "Creates a new user account")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    @ApiResponse(responseCode = "409", description = "User already exists")
    fun createUser(
        @Valid @RequestBody request: CreateUserRequest,
        @RequestHeader("X-Tenant-ID") tenantId: String
    ): ResponseEntity<UserResponse> {
        val command = CreateUserCommand(
            tenantId = TenantId(tenantId),
            email = Email(request.email),
            displayName = request.displayName,
            firstName = request.firstName,
            lastName = request.lastName
        )
        
        val user = userApplicationService.createUser(command)
        val response = UserResponse.from(user)
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    fun getUser(
        @PathVariable userId: String,
        @RequestHeader("X-Tenant-ID") tenantId: String
    ): ResponseEntity<UserResponse> {
        val query = GetUserQuery(UserId(userId), TenantId(tenantId))
        val user = userApplicationService.getUser(query)
        return ResponseEntity.ok(UserResponse.from(user))
    }
}
```

**DTO Design:**
```kotlin
// Request DTOs
data class CreateUserRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,
    
    @field:NotBlank(message = "Display name is required")
    @field:Size(max = 100, message = "Display name cannot exceed 100 characters")
    val displayName: String,
    
    @field:Size(max = 50, message = "First name cannot exceed 50 characters")
    val firstName: String? = null,
    
    @field:Size(max = 50, message = "Last name cannot exceed 50 characters")
    val lastName: String? = null
) {
    fun toCommand(tenantId: TenantId): CreateUserCommand {
        return CreateUserCommand(
            tenantId = tenantId,
            email = Email(email.trim().lowercase()),
            displayName = displayName.trim(),
            firstName = firstName?.trim(),
            lastName = lastName?.trim()
        )
    }
}

// Response DTOs
data class UserResponse(
    val id: String,
    val email: String,
    val displayName: String,
    val firstName: String?,
    val lastName: String?,
    val status: String,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(user: User): UserResponse {
            return UserResponse(
                id = user.id.value,
                email = user.email.value,
                displayName = user.displayName,
                firstName = user.firstName,
                lastName = user.lastName,
                status = user.status.name,
                createdAt = user.createdAt,
                updatedAt = user.updatedAt
            )
        }
    }
}
```

### 5.3 Application Services

**Application Service Responsibilities:**
```kotlin
@Service
@Transactional
class UserApplicationService(
    private val userRepository: UserRepository,
    private val passwordPolicyService: PasswordPolicyService,
    private val domainEventPublisher: DomainEventPublisher,
    private val auditService: AuditService
) {
    
    fun createUser(command: CreateUserCommand): User {
        // Validate business rules
        if (userRepository.existsByEmail(command.email, command.tenantId)) {
            throw UserAlreadyExistsException("User with email ${command.email.value} already exists")
        }
        
        // Create domain object
        val user = User.create(
            id = UserId.generate(),
            email = command.email,
            displayName = command.displayName,
            tenantId = command.tenantId
        )
        
        // Persist aggregate
        val savedUser = userRepository.save(user)
        
        // Publish domain events
        savedUser.domainEvents.forEach { event ->
            domainEventPublisher.publish(event)
        }
        savedUser.clearEvents()
        
        // Audit trail
        auditService.recordUserCreation(savedUser.id, command.tenantId)
        
        return savedUser
    }
    
    fun changePassword(command: ChangePasswordCommand): User {
        val user = userRepository.findById(command.userId)
            ?: throw UserNotFoundException("User ${command.userId.value} not found")
        
        // Validate password policy
        val validationResult = passwordPolicyService.validatePassword(
            command.newPassword, 
            command.userId
        )
        if (!validationResult.isValid) {
            throw PasswordPolicyViolationException(validationResult.violations)
        }
        
        // Domain operation
        val hashedPassword = HashedPassword.fromPlaintext(command.newPassword)
        val updatedUser = user.changePassword(hashedPassword)
        
        // Persist and publish events
        val savedUser = userRepository.save(updatedUser)
        savedUser.domainEvents.forEach { event ->
            domainEventPublisher.publish(event)
        }
        savedUser.clearEvents()
        
        return savedUser
    }
}
```

### 5.4 Repository Pattern

**Repository Interface (in domain package):**
```kotlin
interface UserRepository {
    fun findById(id: UserId): User?
    fun findByEmail(email: Email, tenantId: TenantId): User?
    fun existsByEmail(email: Email, tenantId: TenantId): Boolean
    fun save(user: User): User
    fun delete(user: User)
    fun findByTenant(tenantId: TenantId, pageable: Pageable): Page<User>
}
```

**Repository Implementation (in infrastructure):**
```kotlin
@Repository
class JdbcUserRepository(
    private val jdbcTemplate: JdbcTemplate,
    private val userRowMapper: UserRowMapper
) : UserRepository {
    
    override fun findById(id: UserId): User? {
        return try {
            jdbcTemplate.queryForObject(
                "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
                userRowMapper,
                id.value
            )
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }
    
    override fun save(user: User): User {
        val exists = existsById(user.id)
        
        if (exists) {
            jdbcTemplate.update(
                """
                UPDATE users 
                SET email = ?, display_name = ?, first_name = ?, last_name = ?, 
                    status = ?, updated_at = ?
                WHERE id = ?
                """,
                user.email.value,
                user.displayName,
                user.firstName,
                user.lastName,
                user.status.name,
                Instant.now(),
                user.id.value
            )
        } else {
            jdbcTemplate.update(
                """
                INSERT INTO users (id, tenant_id, email, display_name, first_name, last_name, 
                                 status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                user.id.value,
                user.tenantId.value,
                user.email.value,
                user.displayName,
                user.firstName,
                user.lastName,
                user.status.name,
                user.createdAt,
                user.updatedAt
            )
        }
        
        return user
    }
    
    private fun existsById(id: UserId): Boolean {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE id = ? AND deleted_at IS NULL",
            Int::class.java,
            id.value
        )
        return count > 0
    }
}
```

### 5.5 Validation Strategy

**Three-Layer Validation Approach:**

1. **Input Validation (Controller/DTO Layer):**
   - Format validation (email format, length constraints)
   - Required field validation
   - Type safety and parsing

2. **Business Rule Validation (Domain Layer):**
   - Domain invariants and constraints
   - Business logic validation
   - Cross-entity consistency rules

3. **Infrastructure Validation (Repository Layer):**
   - Database constraints
   - Unique constraints
   - Foreign key constraints

**Example Implementation:**
```kotlin
// DTO Layer - Format validation
data class CreateUserRequest(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank @field:Size(max = 100) val displayName: String
)

// Domain Layer - Business rules
class User {
    fun changeEmail(newEmail: Email, tenantId: TenantId): User {
        // Business rule: Email must be unique within tenant
        require(newEmail != this.email) { "New email must be different from current email" }
        
        // Domain invariant: User must be active to change email
        require(this.isActive) { "Cannot change email for inactive user" }
        
        return this.copy(email = newEmail).also {
            raiseEvent(UserEmailChangedEvent(id, tenantId, email, newEmail))
        }
    }
}

// Application Service - Orchestration validation
@Service
class UserApplicationService {
    fun changeUserEmail(command: ChangeEmailCommand): User {
        val user = userRepository.findById(command.userId)
            ?: throw UserNotFoundException()
        
        // Check business constraint across aggregates
        if (userRepository.existsByEmail(command.newEmail, command.tenantId)) {
            throw EmailAlreadyExistsException()
        }
        
        val updatedUser = user.changeEmail(command.newEmail, command.tenantId)
        return userRepository.save(updatedUser)
    }
}
```

---

## 6. Integration and Communication Patterns

### 6.1 Domain Event Publishing

**Event Publisher Interface:**
```kotlin
interface DomainEventPublisher {
    fun publish(event: DomainEvent)
    fun publishAll(events: List<DomainEvent>)
}

@Component
class SpringDomainEventPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher
) : DomainEventPublisher {
    
    override fun publish(event: DomainEvent) {
        applicationEventPublisher.publishEvent(event)
    }
    
    override fun publishAll(events: List<DomainEvent>) {
        events.forEach { publish(it) }
    }
}
```

**Event Handlers:**
```kotlin
@Component
class UserEventHandler(
    private val notificationService: NotificationService,
    private val auditService: AuditService
) {
    
    @EventListener
    @Async
    fun handleUserCreated(event: UserCreatedEvent) {
        // Send welcome email
        notificationService.sendWelcomeEmail(event.userId, event.email)
        
        // Record audit trail
        auditService.recordUserCreation(event.userId, event.tenantId)
    }
    
    @EventListener
    @Async
    fun handleUserAuthenticated(event: UserAuthenticatedEvent) {
        // Update last login timestamp
        auditService.recordAuthentication(event.userId, event.sessionId, event.ipAddress)
        
        // Check for suspicious activity
        securityService.analyzeAuthenticationPattern(event)
    }
}
```

### 6.2 Cross-Context Integration

**Anti-Corruption Layer Pattern:**
```kotlin
// External system integration with anti-corruption layer
interface ExternalUserService {
    fun syncUser(user: User): ExternalUserSyncResult
    fun getUserFromExternalSystem(externalId: String): ExternalUser?
}

@Service
class ExternalUserServiceAdapter(
    private val externalApiClient: ExternalApiClient
) : ExternalUserService {
    
    override fun syncUser(user: User): ExternalUserSyncResult {
        // Transform domain model to external format
        val externalUserRequest = ExternalUserRequest(
            id = user.id.value,
            email = user.email.value,
            fullName = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim(),
            status = mapUserStatus(user.status)
        )
        
        return try {
            val response = externalApiClient.createOrUpdateUser(externalUserRequest)
            ExternalUserSyncResult.success(response.externalId)
        } catch (e: ExternalApiException) {
            ExternalUserSyncResult.failure(e.message)
        }
    }
    
    private fun mapUserStatus(status: UserStatus): String {
        return when (status) {
            UserStatus.ACTIVE -> "ENABLED"
            UserStatus.INACTIVE -> "DISABLED"
            UserStatus.LOCKED -> "SUSPENDED"
        }
    }
}
```

### 6.3 Saga Pattern for Complex Workflows

**Saga Orchestration:**
```kotlin
@Service
class UserRegistrationSaga(
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val auditService: AuditService,
    private val externalUserService: ExternalUserService
) {
    
    @Transactional
    fun executeUserRegistration(command: RegisterUserCommand): UserRegistrationResult {
        val sagaId = SagaId.generate()
        
        try {
            // Step 1: Create user
            val user = createUser(command, sagaId)
            
            // Step 2: Send verification email
            sendVerificationEmail(user, sagaId)
            
            // Step 3: Sync with external systems
            syncWithExternalSystems(user, sagaId)
            
            // Step 4: Record completion
            recordSagaCompletion(sagaId, user.id)
            
            return UserRegistrationResult.success(user)
            
        } catch (e: Exception) {
            // Compensating actions
            compensateUserRegistration(sagaId, e)
            return UserRegistrationResult.failure(e.message)
        }
    }
    
    private fun createUser(command: RegisterUserCommand, sagaId: SagaId): User {
        val user = User.create(
            id = UserId.generate(),
            email = command.email,
            displayName = command.displayName,
            tenantId = command.tenantId
        )
        
        val savedUser = userRepository.save(user)
        auditService.recordSagaStep(sagaId, "USER_CREATED", savedUser.id.value)
        
        return savedUser
    }
    
    private fun compensateUserRegistration(sagaId: SagaId, error: Exception) {
        auditService.recordSagaFailure(sagaId, error.message)
        // Implement compensating actions based on saga state
    }
}
```

---

## 7. Testing Strategies

### 7.1 Testing Pyramid for DDD

**Unit Tests (Domain Layer):**
```kotlin
class UserTest {
    
    @Test
    fun `should create user with valid data`() {
        // Given
        val userId = UserId.generate()
        val email = Email("test@example.com")
        val displayName = "Test User"
        val tenantId = TenantId.generate()
        
        // When
        val user = User.create(userId, email, displayName, tenantId)
        
        // Then
        assertThat(user.id).isEqualTo(userId)
        assertThat(user.email).isEqualTo(email)
        assertThat(user.displayName).isEqualTo(displayName)
        assertThat(user.isActive).isTrue()
        assertThat(user.domainEvents).hasSize(1)
        assertThat(user.domainEvents.first()).isInstanceOf(UserCreatedEvent::class.java)
    }
    
    @Test
    fun `should raise event when password is changed`() {
        // Given
        val user = createTestUser()
        val newPassword = HashedPassword.fromPlaintext("newPassword123!")
        
        // When
        val updatedUser = user.changePassword(newPassword)
        
        // Then
        assertThat(updatedUser.domainEvents).hasSize(1)
        assertThat(updatedUser.domainEvents.first()).isInstanceOf(UserPasswordChangedEvent::class.java)
    }
    
    @Test
    fun `should not allow password change for inactive user`() {
        // Given
        val user = createTestUser().deactivate()
        val newPassword = HashedPassword.fromPlaintext("newPassword123!")
        
        // When & Then
        assertThatThrownBy {
            user.changePassword(newPassword)
        }.isInstanceOf(IllegalStateException::class.java)
         .hasMessageContaining("inactive user")
    }
}
```

**Integration Tests (Application Layer):**
```kotlin
@SpringBootTest
@Testcontainers
class UserApplicationServiceIntegrationTest {
    
    @Container
    static val postgres = PostgreSQLContainer("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
    
    @Autowired
    private lateinit var userApplicationService: UserApplicationService
    
    @Autowired
    private lateinit var userRepository: UserRepository
    
    @Test
    @Transactional
    fun `should create user and publish events`() {
        // Given
        val command = CreateUserCommand(
            tenantId = TenantId.generate(),
            email = Email("test@example.com"),
            displayName = "Test User"
        )
        
        // When
        val user = userApplicationService.createUser(command)
        
        // Then
        assertThat(user.id).isNotNull()
        
        val savedUser = userRepository.findById(user.id)
        assertThat(savedUser).isNotNull()
        assertThat(savedUser!!.email).isEqualTo(command.email)
        
        // Verify events were published (using test event listener)
        await().atMost(Duration.ofSeconds(5)).untilAsserted {
            assertThat(testEventListener.receivedEvents)
                .hasSize(1)
                .first()
                .isInstanceOf(UserCreatedEvent::class.java)
        }
    }
}
```

**Architecture Tests:**
```kotlin
class ArchitectureTest {
    
    private val importedClasses = ClassFileImporter()
        .importPackages("com.monocto.iam")
    
    @Test
    fun `domain layer should not depend on infrastructure`() {
        val rule = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("..infrastructure..", "..repository..", "..controller..")
        
        rule.check(importedClasses)
    }
    
    @Test
    fun `controllers should only depend on application services`() {
        val rule = classes()
            .that().resideInAPackage("..controller..")
            .should().onlyDependOnClassesThat()
            .resideInAnyPackage(
                "..service..",
                "..client..",
                "..shared..",
                "java..",
                "kotlin..",
                "org.springframework..",
                "jakarta.."
            )
        
        rule.check(importedClasses)
    }
    
    @Test
    fun `bounded contexts should not directly depend on each other`() {
        val rule = noClasses()
            .that().resideInAPackage("..authentication..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("..authorization..", "..mfa..", "..oauth..")
        
        rule.check(importedClasses)
    }
}
```

### 7.2 Test Data Builders

**Domain Object Builders:**
```kotlin
class UserTestDataBuilder {
    private var id: UserId = UserId.generate()
    private var email: Email = Email("test@example.com")
    private var displayName: String = "Test User"
    private var tenantId: TenantId = TenantId.generate()
    private var status: UserStatus = UserStatus.ACTIVE
    
    fun withId(id: UserId) = apply { this.id = id }
    fun withEmail(email: String) = apply { this.email = Email(email) }
    fun withDisplayName(displayName: String) = apply { this.displayName = displayName }
    fun withTenantId(tenantId: TenantId) = apply { this.tenantId = tenantId }
    fun withStatus(status: UserStatus) = apply { this.status = status }
    
    fun build(): User {
        return User.create(id, email, displayName, tenantId)
            .let { user ->
                if (status != UserStatus.ACTIVE) {
                    when (status) {
                        UserStatus.INACTIVE -> user.deactivate()
                        UserStatus.LOCKED -> user.lock("Test lock")
                        else -> user
                    }
                } else {
                    user
                }
            }
    }
    
    companion object {
        fun aUser() = UserTestDataBuilder()
        fun anActiveUser() = UserTestDataBuilder().withStatus(UserStatus.ACTIVE)
        fun anInactiveUser() = UserTestDataBuilder().withStatus(UserStatus.INACTIVE)
        fun aLockedUser() = UserTestDataBuilder().withStatus(UserStatus.LOCKED)
    }
}

// Usage in tests
@Test
fun `should not allow email change for locked user`() {
    // Given
    val user = UserTestDataBuilder.aLockedUser().build()
    val newEmail = Email("new@example.com")
    
    // When & Then
    assertThatThrownBy {
        user.changeEmail(newEmail, user.tenantId)
    }.isInstanceOf(IllegalStateException::class.java)
}
```

### 7.3 Contract Testing for Bounded Contexts

**Consumer-Driven Contract Tests:**
```kotlin
@ExtendWith(PactConsumerTestExt::class)
@PactTestFor(providerName = "user-service", port = "8080")
class UserServiceContractTest {
    
    @Pact(consumer = "authentication-service")
    fun createUserPact(builder: PactDslWithProvider): RequestResponsePact {
        return builder
            .given("user does not exist")
            .uponReceiving("a request to create a user")
            .path("/api/v1/users")
            .method("POST")
            .headers(mapOf("Content-Type" to "application/json"))
            .body(
                PactDslJsonBody()
                    .stringType("email", "test@example.com")
                    .stringType("displayName", "Test User")
                    .stringType("tenantId", "tenant-123")
            )
            .willRespondWith()
            .status(201)
            .headers(mapOf("Content-Type" to "application/json"))
            .body(
                PactDslJsonBody()
                    .stringType("id")
                    .stringType("email", "test@example.com")
                    .stringType("displayName", "Test User")
                    .stringType("status", "ACTIVE")
            )
            .toPact()
    }
    
    @Test
    @PactTestFor(pactMethod = "createUserPact")
    fun testCreateUser() {
        // Test implementation using the contract
        val userOperations = UserOperationsClient("http://localhost:8080")
        val request = CreateUserRequest("test@example.com", "Test User", "tenant-123")
        
        val response = userOperations.createUser(request)
        
        assertThat(response.email).isEqualTo("test@example.com")
        assertThat(response.status).isEqualTo("ACTIVE")
    }
}
```

---

## 8. Build System and Tooling

### 8.1 Shared Build Logic & Dependency Management

- Every Kotlin build participates in the `build-logic/` included build. Spring Boot services apply the `com.monocto.kotlin.spring-service` convention plugin, Ktor services use `com.monocto.kotlin.ktor-service`, JVM libraries use `com.monocto.kotlin.jvm-library`, and standalone test suites use `com.monocto.kotlin.test-suite`.
- Convention plugins wire Java 21 toolchains, Kotlin compiler flags, JUnit 5, and Jacoco 0.8.12. Do **not** re-declare those blocks inside service build scripts; extend the plugin if additional behaviour is required.
- All dependencies and Gradle plugins must come from the shared version catalog (`libs`) that lives in `gradle/libs.versions.toml`. Use catalog aliases instead of hard-coded coordinates or versions.
- When a service needs an additional dependency or plugin, add it to the shared catalog and document the addition in the owning service README.

### 8.2 Continuous Integration Workflow

- Kotlin services are verified by the `kotlin-services-ci` workflow, triggered on pushes and pull requests that touch any JVM service directory (`iam-auth-api/**`, `iam-admin-api/**`, `user-profile-api/**`, `booking-api/**`, `inventory-availability-service/**`, `product-api/**`, `rewards-api/**`, `search-api/**`) or shared Gradle build logic.
- The workflow uses `pnpm dlx nx print-affected` to calculate the impacted Gradle projects. Only the affected services (or the full list when shared build logic changes) are expanded into the job matrix so that each service builds in isolation.
- Each matrix entry provisions required infrastructure (databases, caches, etc. as needed), executes `:service:test`, `:service:jacocoTestReport`, and `:service:build`, and uploads the Jacoco HTML report artifact produced by the convention plugins.

### 8.3 Database Migrations

- When you modify domain entities that map to the relational schema (e.g., add/remove columns, change indexes, rename tables), you must also add/update the corresponding database migrations for the owning service.
- Follow the repository-wide process documented in [README.md](../README.md#database-migrations).
- Keep changes atomic and ensure you provide deploy, revert, and verify scripts per the Sqitch conventions described in the README.

---

## 9. Implementation Guidelines

### 9.1 Controller Rules (HTTP Layer)

- Must follow RESTful principles.
  - Use meaningful resource URIs, HTTP verbs, and proper status mapping.
  - Example: `POST /api/v1/users`, `GET /api/v1/products/{id}`, `POST /api/v1/bookings`
- Must declare Swagger/OpenAPI annotations for discovery and documentation.
  - Use `@Tag`, `@Operation`, `@ApiResponse`, `@SecurityRequirement`, and parameter/request schema annotations.
- Only handle HTTP-related concerns:
  - Path/query parsing, pagination, sorting, media types, status codes, error mapping.
  - Do **not** implement business rules or cross-entity validations in controllers.
  - Delegate to services for domain logic such as business rule validation or complex operations.
- Validation at controller boundary is limited to input format/shape:
  - Use Bean Validation (`@Valid` and `jakarta.validation.*` annotations) on DTOs for nullability, size, range, and basic format constraints.
  - Do not validate domain relationships here (e.g., whether referenced entities exist); push that to the domain/service layer.

### 9.2 Request/Response DTO Rules (Client Layer)

- Request bodies must be modeled as top-level Kotlin data classes, one per file whenever the controller grows beyond a few requests.
  - No nested classes, enums, or sub-classes inside the same file as the request class once they become reusable.
  - Package convention: `<domain>/<subdomain>/client` for reusable DTO packages. For small controllers, co-locating request DTOs is acceptable, but migrate to dedicated packages as they grow.
- Apply `jakarta.validation` constraints on DTO properties.
  - Example: `@field:NotBlank`, `@field:Size`, `@field:Email`, `@field:Pattern`, `@field:Valid` on nested DTOs.
- DTOs must not contain business logic.
  - Allowed: trivial mapping helpers (e.g., `toCommand()`, `toDomain()`) that perform field-level transformations and sanitization (trimming, lowercasing).
  - Not allowed: stateful or cross-entity validation.
- Responses are separate DTOs from domain entities.
  - Expose only necessary fields, and shape them for client needs.

### 9.3 Services (Application Layer)

- Services orchestrate use cases by coordinating domain objects and repositories.
  - Implement transaction boundaries where needed (e.g., creating related entities atomically).
  - Aggregate calls across repositories or external clients.
- Services must not leak infrastructure concerns (e.g., SQL details, cache key formats) — keep those inside repositories or adapters.
- Services call domain mutation methods for state changes instead of mutating fields scattered across services.

### 9.4 Domain Rules (Domain Layer)

- Domain entities encapsulate all object mutations.
  - Provide explicit mutation methods such as `User.withUpdatedEmail(...)`, `Product.activate()`, etc.
  - Keep invariants inside domain methods to ensure consistency (services are responsible for using domain primitives instead of editing maps or DTOs directly).
- Domain objects represent core concepts and can provide conversion helpers:
  - `User.fromCreateRequest(request: CreateUserRequest): User`
  - `Product.toResponse(): ProductDto`
- Domain entities that map to persistence (e.g., MySQL tables) use JPA annotations or JDBC mappers as appropriate.
  - JSON columns and complex types should use proper type mappers (e.g., `JsonStringType`) or Jackson converters defined in the persistence layer.

### 9.5 DTO–Domain Conversion

- Perform explicit conversions between DTOs and domain entities.
  - Request DTO → Domain (e.g., `CreateUserRequest.toCommand()` consumed by `UserService`).
  - Domain → Response DTO (e.g., `User.toDto()`).
- Keep normalization (trim, lowercase, slugify) localized to conversion/mutation points.
- Avoid mixing persistence details into DTOs.

### 9.6 Repository Rules (Infrastructure Layer)

- Define repository contracts as interfaces in the domain package (e.g., `UserRepository`, `ProductRepository`).
- Provide vendor-specific implementations that decorate/compose each other:
  - `JdbcUserRepository` encapsulates SQL and mapping logic.
  - Add cache decorators or other vendor-specific adapters by implementing the same interface and delegating to the JDBC implementation.
- Interfaces should return domain entities or value objects, not DTOs.
- Keep cache key patterns and serialization localized to vendor implementations.

### 9.7 Validation Placement

- In DTOs (client layer): input shape constraints, nullability, size, range, and simple formats.
- In domain: business invariants and stateful rules, encapsulated in mutation methods.
- In controller: primitive checks limited to HTTP concerns (e.g., verifying that path segments match expected formats) but not business rules.

### 9.8 Self-Documenting Code Rules

**No Inline Comments Policy:**
- Code must be self-explanatory without inline comments
- If you need a comment to explain what code does, refactor instead
- Use intention-revealing names for all identifiers
- Extract complex logic into well-named methods

**Refactoring Over Commenting Examples:**
```kotlin
// ❌ WRONG: Using comments to explain complex logic
fun processUser(user: User): ProcessingResult {
    // Check if user is eligible for premium features
    if (user.subscriptionType == "PREMIUM" && user.accountAge > 30 && user.paymentStatus == "CURRENT") {
        // Apply premium processing logic
        return applyPremiumProcessing(user)
    }
    
    // Apply standard processing for regular users
    return applyStandardProcessing(user)
}

// ✅ CORRECT: Self-documenting with extracted methods
fun processUser(user: User): ProcessingResult {
    return if (user.isEligibleForPremiumFeatures()) {
        applyPremiumProcessing(user)
    } else {
        applyStandardProcessing(user)
    }
}

private fun User.isEligibleForPremiumFeatures(): Boolean {
    return hasPremiumSubscription() && 
           hasMaturedAccount() && 
           hasCurrentPaymentStatus()
}

private fun User.hasPremiumSubscription(): Boolean = subscriptionType == "PREMIUM"
private fun User.hasMaturedAccount(): Boolean = accountAge > 30
private fun User.hasCurrentPaymentStatus(): Boolean = paymentStatus == "CURRENT"
```

**SOLID Principles Application:**
```kotlin
// ❌ WRONG: Violating Single Responsibility Principle
class UserService {
    fun createUser(userData: UserData): User {
        // Validation, creation, email sending, audit logging all in one method
    }
}

// ✅ CORRECT: Each class has single responsibility
class UserService(
    private val userValidator: UserValidator,
    private val userRepository: UserRepository,
    private val userNotificationService: UserNotificationService,
    private val auditService: AuditService
) {
    fun createUser(userData: UserData): User {
        val validatedData = userValidator.validate(userData)
        val user = userRepository.create(validatedData)
        userNotificationService.sendWelcomeEmail(user)
        auditService.recordUserCreation(user)
        return user
    }
}
```

### 9.9 File Organization Rules

**Strict One-Class-Per-File Rule:**
- **MANDATORY**: Each Kotlin file MUST contain exactly one top-level class, interface, or data class
- **File Naming**: The file name MUST match the class name exactly (e.g., `User.kt` contains `class User`)
- **No Exceptions**: Do NOT create multiple data classes, entities, or DTOs in a single file, even if they seem "related"

**Allowed Exceptions (Very Limited):**
- **Companion Objects**: Only when they belong to the main class in the file
- **Private Nested Classes**: Only when they are implementation details of the main class and marked `private`
- **Sealed Class Hierarchies**: Only the sealed parent and its immediate subclasses in one file, and only when subclasses are simple (no complex logic)

**Common Anti-Patterns to Avoid:**
```kotlin
// ❌ WRONG: Multiple data classes in one file
// File: UserDtos.kt
data class CreateUserRequest(val name: String, val email: String)
data class UpdateUserRequest(val name: String?)
data class UserResponse(val id: String, val name: String, val email: String)

// ✅ CORRECT: Separate files
// File: CreateUserRequest.kt
data class CreateUserRequest(val name: String, val email: String)

// File: UpdateUserRequest.kt  
data class UpdateUserRequest(val name: String?)

// File: UserResponse.kt
data class UserResponse(val id: String, val name: String, val email: String)
```

### 9.10 Shared Tooling Placement

- Cross-service tooling, extensions, or Spring Boot starters that should be reused by multiple JVM services belong in [`infrasupport/kotlin/core-sdk`](../infrasupport/kotlin/core-sdk). Add README updates there whenever new modules are introduced.
- Service-specific utilities that only make sense inside a particular service must live under that service's subdomain packages (`/<service>/<domain>/<layer>`). Do **not** create ad-hoc "shared" packages inside a service if the code needs to be consumed elsewhere—move it into `infrasupport/kotlin/core-sdk` instead.

---

## 10. Examples and References

### 10.1 Reference Implementation

The `iam-auth-api` service serves as the reference implementation of these architectural principles:

**Domain Structure:**
```
/iam-auth-api/src/main/kotlin/com/monocto/iam/
├── authentication/          # Core authentication flows
├── authorization/          # RBAC and token management
├── mfa/                    # Multi-factor authentication
├── oauth/                  # OAuth protocol handling
├── federation/             # SSO and external providers
├── tenant/                # Multi-tenancy
└── shared/                # Shared domain components
```

### 10.2 Example Pointers

**Controllers with Swagger and HTTP-only concerns:**
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/authentication/controller/AuthenticationController.kt`](../iam-auth-api/src/main/kotlin/com/monocto/iam/authentication/controller/AuthenticationController.kt)
- [`iam-admin-api/src/main/kotlin/com/monocto/iam/admin/controller/AdminController.kt`](../iam-admin-api/src/main/kotlin/com/monocto/iam/admin/controller/AdminController.kt)

**DTOs with validation and conversion helpers:**
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/auth/client`](../iam-auth-api/src/main/kotlin/com/monocto/iam/auth/client) (see `RegisterRequest`, `AuthResponse`)

**Domain entities with mutation and conversion helpers:**
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/identity/service/IdentityService.kt`](../iam-auth-api/src/main/kotlin/com/monocto/iam/identity/service/IdentityService.kt)
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/identity/domain/AuthSession.kt`](../iam-auth-api/src/main/kotlin/com/monocto/iam/identity/domain/AuthSession.kt)

**Repository interface + implementation:**
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/identity/repository/IdentityRepository.kt`](../iam-auth-api/src/main/kotlin/com/monocto/iam/identity/repository/IdentityRepository.kt)
- [`iam-auth-api/src/main/kotlin/com/monocto/iam/identity/repository/JdbcIdentityRepository.kt`](../iam-auth-api/src/main/kotlin/com/monocto/iam/identity/repository/JdbcIdentityRepository.kt)

### 10.3 Do/Don't Checklist

**General Rules:**
- **Do**: Use `@Operation`/`@ApiResponse` on controllers and document parameters/requests
- **Do**: Keep exactly one class per file - this applies to DTOs, entities, services, controllers, and all other classes
- **Do**: Write self-documenting code with intention-revealing names
- **Do**: Extract complex logic into well-named private methods
- **Do**: Apply SOLID principles rigorously in every design decision
- **Do**: Build scalable solutions from the start
- **Do**: Route all state changes through domain or service methods
- **Do**: Convert explicitly between DTOs and domain entities
- **Do**: Keep repositories as interfaces with vendor-specific implementations
- **Don't**: Use inline comments to explain what code does (refactor instead)
- **Don't**: Choose "quick fix" solutions that compromise scalability
- **Don't**: Violate SOLID principles for convenience
- **Don't**: Create large methods that need comments to understand
- **Don't**: Perform domain relation checks in controllers
- **Don't**: Scatter field mutations across services — keep them in domain objects
- **Don't**: Return domain entities directly to clients; map to response DTOs
- **Don't**: Put multiple data classes, entities, or DTOs in a single file

**Domain-Driven Design:**
- **Do**: Organize code by business domain boundaries, not technical layers
- **Do**: Keep all domain components (controller, service, domain, repository) together in domain packages
- **Do**: Use consistent package structure across all domains: `/{domain}/controller`, `/{domain}/service`, `/{domain}/domain`, `/{domain}/repository`
- **Do**: Create one file per class - each data class, entity, DTO, service, and controller gets its own file
- **Do**: Use interfaces for cross-domain service communication
- **Do**: Keep shared domain models (core entities, value objects) in `/shared/domain/`
- **Do**: Allow domains to depend on shared infrastructure services
- **Don't**: Mix multiple domain concerns in a single controller or service
- **Don't**: Create cross-domain dependencies without well-defined interfaces
- **Don't**: Group multiple classes in one file, even within the same domain
- **Don't**: Create direct controller-to-controller dependencies across domains
- **Don't**: Leak implementation details through domain interfaces

**Migration and Refactoring:**
- **Do**: Preserve all existing REST API endpoints during refactoring
- **Do**: Maintain all existing service method signatures and behaviors
- **Do**: Ensure all existing tests continue to pass
- **Don't**: Break backward compatibility for client integrations
- **Don't**: Change functionality during structural refactoring

This comprehensive architecture guide provides clear domain boundaries, reduces coupling, and improves maintainability while preserving all existing functionality. The `iam-auth-api` service serves as a reference implementation of these principles.