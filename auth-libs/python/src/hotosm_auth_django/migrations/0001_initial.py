from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        # Create table if not exists (idempotent)
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS hanko_user_mappings (
                    hanko_user_id VARCHAR(255) PRIMARY KEY,
                    app_user_id VARCHAR(255) NOT NULL,
                    app_name VARCHAR(255) NOT NULL DEFAULT 'default',
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NULL
                );
            """,
            reverse_sql="DROP TABLE IF EXISTS hanko_user_mappings;",
        ),
        # Add updated_at column if not exists (for tables created before this column was added)
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'hanko_user_mappings' AND column_name = 'updated_at'
                    ) THEN
                        ALTER TABLE hanko_user_mappings ADD COLUMN updated_at TIMESTAMP NULL;
                    END IF;
                END $$;
            """,
            reverse_sql="",  # No reverse needed
        ),
        # Add unique constraint if not exists
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'uq_hanko_app'
                    ) THEN
                        ALTER TABLE hanko_user_mappings
                        ADD CONSTRAINT uq_hanko_app UNIQUE (hanko_user_id, app_name);
                    END IF;
                END $$;
            """,
            reverse_sql="ALTER TABLE hanko_user_mappings DROP CONSTRAINT IF EXISTS uq_hanko_app;",
        ),
        # Add index if not exists
        migrations.RunSQL(
            sql="""
                CREATE INDEX IF NOT EXISTS idx_app_user_id
                ON hanko_user_mappings (app_user_id, app_name);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_app_user_id;",
        ),
    ]
