-- Players can sign the high-score table with three letters.
ALTER TABLE "User" ADD COLUMN "initials" VARCHAR(3);
