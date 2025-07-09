package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

// Example response from OSM details.json
// {
// 	"version": "0.6",
// 	"generator": "OpenStreetMap server",
// 	"copyright": "OpenStreetMap and contributors",
// 	"attribution": "http://www.openstreetmap.org/copyright",
// 	"license": "http://opendatacommons.org/licenses/odbl/1-0/",
// 	"user": {
// 		"id": 16289154,
// 		"display_name": "spwoodcock",
// 		"account_created": "2022-06-15T19:29:04Z",
// 		"description": "Working with HOTOSM...",
// 		"contributor_terms": {
// 			"agreed": true,
// 			"pd": false
// 		},
// 		"img": {
// 			"href": "https://www.openstreetmap.org/rails/active_storage/representations/redirect/xxx/78538841.jpg"
// 		},
// 		"roles": [],
// 			"changesets": {
// 			"count": 15
// 		},
// 			"traces": {
// 			"count": 0
// 		},
// 		"blocks": {
// 			"received": {
// 				"count": 0,
// 				"active": 0
// 			}
// 		},
// 		"languages": [
// 			"en-GB",
// 			"en"
// 		],
// 		"messages": {
// 			"received": {
// 				"count": 0,
// 				"unread": 0
// 			},
// 			"sent": {
// 				"count": 5
// 			}
// 		}
// 	}
// }

// OSMUser represents the structure of /api/0.6/user/details.json
type OSMUser struct {
	User struct {
		ID             int    `json:"id"`
		DisplayName    string `json:"display_name"`
		AccountCreated string `json:"account_created"`
		Description    string `json:"description"`
		Img            struct {
			Href string `json:"href"`
		} `json:"img"`
	} `json:"user"`
}

// Struct for OpenID Connect userinfo response
type UserInfo struct {
	Sub   string `json:"sub"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func userinfoHandler(w http.ResponseWriter, r *http.Request) {
	// Get OAuth2 token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "missing Authorization header", http.StatusUnauthorized)
		return
	}

	// Call OSM user details API with same token
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://www.openstreetmap.org/api/0.6/user/details.json", nil)
	if err != nil {
		http.Error(w, "failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", authHeader)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("OSM user details failed: %v", resp.Status), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	var osmUser OSMUser
	if err := json.NewDecoder(resp.Body).Decode(&osmUser); err != nil {
		http.Error(w, "failed to parse OSM response", http.StatusInternalServerError)
		return
	}

	// Build userinfo response
	userinfo := UserInfo{
		Sub:   fmt.Sprintf("%d", osmUser.User.ID),
		Name:  osmUser.User.DisplayName,
		Email: "no-reply@hotosm.org",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userinfo)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	http.HandleFunc("/", userinfoHandler)
	log.Printf("Listening on :%s ...", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
