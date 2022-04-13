import secrets

#  OWASP recommends 128-bit minimum for session IDs.
SECURE_TOKEN_BYTE_LENGTH = 128 // 8


def build_token():
    return secrets.token_urlsafe(SECURE_TOKEN_BYTE_LENGTH)
