#!/bin/bash
# Generate Bruno API collections for services that don't have them yet

set -euo pipefail

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Generating Bruno collections for remaining services...${NC}"

# Function to create environment files
create_env_files() {
    local service=$1
    local port=$2
    local bruno_dir="$service/bruno"
    
    # Local environment
    cat > "$bruno_dir/environments/local.env" <<EOF
baseUrl=http://localhost:$port
authToken=
EOF
    
    # Staging environment
    cat > "$bruno_dir/environments/staging.env" <<EOF
baseUrl=https://staging-$service.chessmate.com
authToken=
EOF
    
    # Production environment
    cat > "$bruno_dir/environments/production.env" <<EOF
baseUrl=https://$service.chessmate.com
authToken=
EOF
    
    echo -e "${GREEN}✓${NC} Created environment files for $service"
}

# Function to create collection metadata
create_collection_meta() {
    local service=$1
    local service_name=$2
    local bruno_dir="$service/bruno"
    
    cat > "$bruno_dir/collections/${service}.bru" <<EOF
meta {
  name: $service_name
  type: collection
  version: 1.0.0
}

docs {
  # $service_name Collection
  
  API endpoints for $service
}
EOF
    
    echo -e "${GREEN}✓${NC} Created collection metadata for $service"
}

# Function to create health check endpoint
create_health_check() {
    local service=$1
    local bruno_dir="$service/bruno"
    
    cat > "$bruno_dir/collections/health.bru" <<EOF
meta {
  name: Health Check
  type: http
  seq: 1
}

request {
  method: GET
  url: \${baseUrl}/health
}

headers {
  Content-Type: application/json
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has status", function() {
    expect(res.body.status).to.equal("ok");
  });

  test("response has service name", function() {
    expect(res.body.service).to.not.be.null;
  });
}
EOF
    
    echo -e "${GREEN}✓${NC} Created health check for $service"
}

# Matchmaking API
if [ ! -f "matchmaking-api/bruno/environments/local.env" ]; then
    echo -e "\n${BLUE}Processing matchmaking-api...${NC}"
    create_env_files "matchmaking-api" "8003"
    create_collection_meta "matchmaking-api" "Matchmaking API"
    create_health_check "matchmaking-api"
    
    # Queue join endpoint
    cat > "matchmaking-api/bruno/collections/post-join-queue.bru" <<'EOF'
meta {
  name: POST Join Queue
  type: http
  seq: 2
}

request {
  method: POST
  url: ${baseUrl}/v1/queues/{{queueId}}/join
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

body:application/json {
  {
    "user_rating": 1500,
    "preferences": {
      "time_control": "blitz"
    }
  }
}

vars:pre-request {
  queueId: standard_blitz
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has queue confirmation", function() {
    expect(res.body.queue_id).to.not.be.null;
    expect(res.body.position).to.not.be.null;
  });
}
EOF
fi

# Bot Orchestrator API
if [ ! -f "bot-orchestrator-api/bruno/environments/local.env" ]; then
    echo -e "\n${BLUE}Processing bot-orchestrator-api...${NC}"
    create_env_files "bot-orchestrator-api" "8010"
    create_collection_meta "bot-orchestrator-api" "Bot Orchestrator API"
    create_health_check "bot-orchestrator-api"
    
    # Bot move endpoint
    cat > "bot-orchestrator-api/bruno/collections/post-bot-move.bru" <<'EOF'
meta {
  name: POST Get Bot Move
  type: http
  seq: 2
}

request {
  method: POST
  url: ${baseUrl}/v1/bots/{{botId}}/move
}

headers {
  Content-Type: application/json
}

body:application/json {
  {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "move_history": []
  }
}

vars:pre-request {
  botId: stockfish_level_5
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has move", function() {
    expect(res.body.move).to.not.be.null;
  });
}
EOF
fi

# Chess Knowledge API
if [ ! -f "chess-knowledge-api/bruno/environments/local.env" ]; then
    echo -e "\n${BLUE}Processing chess-knowledge-api...${NC}"
    create_env_files "chess-knowledge-api" "8011"
    create_collection_meta "chess-knowledge-api" "Chess Knowledge API"
    create_health_check "chess-knowledge-api"
    
    # Opening book endpoint
    cat > "chess-knowledge-api/bruno/collections/post-opening-book.bru" <<'EOF'
meta {
  name: POST Query Opening Book
  type: http
  seq: 2
}

request {
  method: POST
  url: ${baseUrl}/v1/opening/book-moves
}

headers {
  Content-Type: application/json
}

body:application/json {
  {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has moves", function() {
    expect(Array.isArray(res.body.moves)).to.be.true;
  });
}
EOF
    
    # Tablebase endpoint
    cat > "chess-knowledge-api/bruno/collections/post-tablebase.bru" <<'EOF'
meta {
  name: POST Query Tablebase
  type: http
  seq: 3
}

request {
  method: POST
  url: ${baseUrl}/v1/endgame/tablebase
}

headers {
  Content-Type: application/json
}

body:application/json {
  {
    "fen": "8/8/8/8/8/4K3/4P3/4k3 w - - 0 1"
  }
}

tests {
  test("status is 200 or 204", function() {
    expect([200, 204]).to.include(res.status);
  });

  test("if 200, response has move", function() {
    if (res.status === 200) {
      expect(res.body.move).to.not.be.null;
    }
  });
}
EOF
fi

# Engine Cluster API
if [ ! -f "engine-cluster-api/bruno/environments/local.env" ]; then
    echo -e "\n${BLUE}Processing engine-cluster-api...${NC}"
    create_env_files "engine-cluster-api" "8012"
    create_collection_meta "engine-cluster-api" "Engine Cluster API"
    create_health_check "engine-cluster-api"
    
    # Engine analysis endpoint
    cat > "engine-cluster-api/bruno/collections/post-analyze.bru" <<'EOF'
meta {
  name: POST Analyze Position
  type: http
  seq: 2
}

request {
  method: POST
  url: ${baseUrl}/v1/engine/analyze
}

headers {
  Content-Type: application/json
}

body:application/json {
  {
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "depth": 15,
    "multi_pv": 3
  }
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has analysis", function() {
    expect(res.body.best_move).to.not.be.null;
    expect(res.body.evaluation).to.not.be.null;
  });
}
EOF
fi

# Enhance rating-api (it already has some collections)
if [ -f "rating-api/bruno/collections/Rating API/POST ingest game.bru" ]; then
    echo -e "\n${BLUE}Enhancing rating-api...${NC}"
    
    # Check if environment files exist
    if [ ! -f "rating-api/bruno/environments/local.env" ]; then
        create_env_files "rating-api" "8013"
    fi
    
    # Move existing collections to root
    if [ -d "rating-api/bruno/collections/Rating API" ]; then
        mv "rating-api/bruno/collections/Rating API"/*.bru "rating-api/bruno/collections/" 2>/dev/null || true
        rmdir "rating-api/bruno/collections/Rating API" 2>/dev/null || true
    fi
    
    # Create health check if missing
    if [ ! -f "rating-api/bruno/collections/health.bru" ]; then
        create_health_check "rating-api"
    fi
    
    # Create collection metadata if missing
    if [ ! -f "rating-api/bruno/collections/rating-api.bru" ]; then
        create_collection_meta "rating-api" "Rating API"
    fi
    
    echo -e "${GREEN}✓${NC} Enhanced rating-api collections"
fi

echo -e "\n${GREEN}✅ Bruno collection generation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review generated collections in each service's bruno/ directory"
echo "2. Add service-specific endpoints as needed"
echo "3. Create multi-step workflow tests in bruno/tests/"
echo "4. Update service.yaml files with bruno commands"
