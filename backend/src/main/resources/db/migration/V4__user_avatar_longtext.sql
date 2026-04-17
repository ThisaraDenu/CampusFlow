-- Store profile avatars as data URLs; needs more than TEXT (64KB) for most images.
ALTER TABLE users
    MODIFY avatar LONGTEXT;

