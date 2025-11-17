export const serviceSchema = {
  schemaVersion: 1,
  name: "",
  domain: "",
  team: "",
  path: "",

  tech: {
    language: "",
    framework: "",
    runtime: "",
  },

  commands: {
    dev: "",
    test: "",
    build: "",
    lint: "",
    migrate: "",
  },

  infra: {
    port: 0,
    resources: {
      cpu: "",
      memory: "",
    },
  },

  dependencies: {
    services: [],
    databases: [],
    caches: [],
  },

  env: {
    local: {
      configFiles: [],
    },
    dev: {
      baseUrl: "",
    },
    stg: {
      baseUrl: "",
    },
    prod: {
      baseUrl: "",
    },
  },

  docs: {
    overview: "",
    spec: "",
    adrDir: "",
    dashboards: [],
  },

  tags: [],
};