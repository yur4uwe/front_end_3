package token

import (
	"crypto/sha256"
	"encoding/hex"
)

func CreateToken(ctx string) string {
	hash := sha256.New()
	hash.Write([]byte(ctx))
	return hex.EncodeToString(hash.Sum(nil))
}
