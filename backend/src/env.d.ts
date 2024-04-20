declare global {
    namespace NodeJS {
        interface ProcessEnv {
            KEYCLOAK_REALM: string;
            KEYCLOAK_ORIGIN: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export { }
