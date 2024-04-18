import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    url: import.meta.env.VITE_KEYCLOAK_URL,
});

export default keycloak;
