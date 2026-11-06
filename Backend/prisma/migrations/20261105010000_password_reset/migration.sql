CREATE TABLE "PasswordReset" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
