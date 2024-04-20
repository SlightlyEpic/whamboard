import jwt from 'jsonwebtoken';
import jwks from 'jwks-rsa';

const jwksClient = new jwks.JwksClient({
    jwksUri: `${process.env.KEYCLOAK_ORIGIN}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`
    // jwksUri: `http://localhost:8080/realms/whamboard-dev/protocol/openid-connect/certs`
});

export async function verifyToken(token: string): Promise<{ sid: string, name: string }> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, (header, callback) => {
            jwksClient.getSigningKey(header.kid, function (err, key) {
                if (!key) {
                    console.log('rejected');
                    reject(err);
                    return;
                }
                // @ts-expect-error This is from https://www.npmjs.com/package/jsonwebtoken
                let signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            });
        }, undefined, (err, decoded) => {
            if(err) {
                reject(err);
                return;
            }
            resolve({
                // @ts-expect-error it exists
                sid: decoded.sid,
                // @ts-expect-error it exists
                name: decoded.name
            });
        });
    });
}
