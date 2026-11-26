package com.library.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/library_db}")
    private String configuredDbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String configuredUsername;

    @Value("${spring.datasource.password:postgres}")
    private String configuredPassword;

    @Value("${spring.profiles.active:h2}")
    private String activeProfile;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. If H2 profile is explicitly active and no cloud DB_URL is given, use H2
        String rawUrl = System.getenv("DB_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = configuredDbUrl;
        }

        log.info("Configuring DataSource for URL prefix: {}", rawUrl.contains("@") ? rawUrl.substring(0, rawUrl.indexOf("@")) : rawUrl);

        if (rawUrl.startsWith("jdbc:h2:")) {
            if (rawUrl.startsWith("jdbc:h2:file:") && !rawUrl.contains("AUTO_SERVER=TRUE")) {
                rawUrl += ";AUTO_SERVER=TRUE";
            }
            config.setJdbcUrl(rawUrl);
            config.setDriverClassName("org.h2.Driver");
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            return new HikariDataSource(config);
        }

        // 2. Automatically handle raw cloud URLs starting with postgres:// or postgresql:// (from Neon, Supabase, Render)
        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                // Temporarily replace scheme with http:// so java.net.URI can parse user, host, port, path, and query safely
                String cleanForParsing = rawUrl.replaceFirst("^postgres(ql)?://", "http://");
                URI uri = new URI(cleanForParsing);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    // Remove channel_binding parameter if present as some drivers reject it
                    String sanitizedQuery = query.replaceAll("channel_binding=[^&]*&?", "").replaceAll("&$", "");
                    if (!sanitizedQuery.isBlank()) {
                        jdbcUrl += "?" + sanitizedQuery;
                    } else {
                        jdbcUrl += "?sslmode=require";
                    }
                } else {
                    jdbcUrl += "?sslmode=require";
                }

                log.info("Normalized Cloud PostgreSQL URL to JDBC format: {}", jdbcUrl);
                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                }
            } catch (Exception e) {
                log.warn("Could not parse URI with java.net.URI, falling back to prefix replacement: {}", e.getMessage());
                String fallbackUrl = rawUrl.replaceFirst("^postgres(ql)?://", "jdbc:postgresql://");
                config.setJdbcUrl(fallbackUrl);
            }
        } else {
            // Already starts with jdbc:postgresql://
            config.setJdbcUrl(rawUrl);
        }

        // 3. Fallback to explicit environment variables if username/password not in URL
        if (config.getUsername() == null || config.getUsername().isBlank()) {
            String envUser = System.getenv("DB_USERNAME");
            config.setUsername(envUser != null && !envUser.isBlank() ? envUser : configuredUsername);
        }

        if (config.getPassword() == null || config.getPassword().isBlank()) {
            String envPass = System.getenv("DB_PASSWORD");
            config.setPassword(envPass != null && !envPass.isBlank() ? envPass : configuredPassword);
        }

        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }
}
