# OSM UserInfo API

Unfortunately OSM does not implement OpenID Connect fully.
Standard claims: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims

For hanko we have the following config:

```yaml
  custom_providers:
    openstreetmap:
      authorization_endpoint: "https://www.openstreetmap.org/oauth2/authorize" # ✅ this works
      token_endpoint: "https://www.openstreetmap.org/oauth2/token" # ✅ this works
      # userinfo_endpoint: "https://www.openstreetmap.org/oauth2/userinfo" # ❌ this endpoint is forbidden
      userinfo_endpoint: "https://www.openstreetmap.org/api/0.6/user/details.json" ❌ # this endpoint does not have an email, so fails parsing in hanko
```

Also using an attribute mapping seemed to not work:

```yaml
        sub: user.id
        name: user.display_name
        # email is not included in osm, so we have to set manually, else failure
        email: user.description
# OR
      attribute_mapping:
        sub: custom_claims.user.id
        name: custom_claims.user.display_name
        # email is not included in osm, so we have to set manually, else failure
        email: custom_claims.user.description
```

Hence we had to create this small single endpoint API that:
- Accepts a request to `userinfo.login.hotosm.org`.
- Parses the OSM `user.id` and `user.display_name` values.
- Return a valid OpenID Connect set of claims:

```yaml
{
  "sub": "user.id",
  "name": "user.display_name",
  "email": "does-not-exist@hotosm.org"
}
```
