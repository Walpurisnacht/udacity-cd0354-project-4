import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

/* Hard-coded certificate from Auth0 */
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJRS/Ve66fbyeFMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1jdmMzdjJ0YzIxMWNxeGFmLnVzLmF1dGgwLmNvbTAeFw0yNDA1Mjcx
MjE2NDFaFw0zODAyMDMxMjE2NDFaMCwxKjAoBgNVBAMTIWRldi1jdmMzdjJ0YzIx
MWNxeGFmLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMpV42Gd2FKLnToff5JtPvXmbiz10DCL5dA+UASNk7drfL6lRAfLopVMSMGu
FtG1cKqf00vbS53aFO5Zd2CyaahEv8TMM9c2HWg+/yU6/pf2p8GGVYlJGgQUp6IW
TNTTYrw6nA/EP9se3xOwG9qqjpvWM3i5IJWI0stqe6MeZxYxPE9Oh8TUvmpWZjVV
l2uEAdjJSs+eBst4m/2Fc5iHu9VRnaxUEd5lPoPeOOmpo571N3P+t8KfTYVuSScz
182acAS/IgpTkGoiGE+VsPe64ITJt6s6qKKbrZK7FqVJDSerdjQqcT7nHmerU/ji
2s91zECS2uDuYWm/aMUFc+GRRG8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUkhEHl7AAJFdLxYFqmK7nZy6Mo/owDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBOlQo7r+aHULshL2vfzldRa5zugkmYXS1GAJmEUp/2
HNqkzGFk/rZ/yRuMkQe8ovtFvHX5gWdyZbaJG87MZ1G2+CUen3oUvbl7P4zJOxPi
IKf/8CX0b6kFEAKQZL1HOvYk5s+odi4uzWqRcxUs5v9+7MqddloryMJtnKil4noJ
8qKc2x/rMwGLHoniKVl9VoR5IjP0oEa7F/sjgvFq9G8TlLufh4K53/jer3joG1nY
tKxxMcGiGYVvZyrm3yCcNl5vdlx/V/z6/41/Tz1s3218tTyOmDCZjrkfL/3NxVGU
igCjrtgRWdxOzybcLu4sEuCkR5VBaj7Qq2PeC8taPqQW
-----END CERTIFICATE-----`

const logger = createLogger('auth')

const jwksUrl = 'https://dev-cvc3v2tc211cqxaf.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info("User was authorized", {
      userId: jwtToken.sub
    });

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: WIP Implement token verification
  jsonwebtoken.verify(token, certificate, {algorithms: ['RS256']})
  return jwt;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
