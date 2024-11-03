from datetime import datetime
import ossapi
import json
import time
import os

# Your client credentials
CLIENT_ID = 31586
API_KEY = "Sty09gmsufGNjadWZyhNftashebxHV7lML7YFJJy"

# Initialize Ossapi client
client = ossapi.Ossapi(client_id=CLIENT_ID, client_secret=API_KEY)

# Load previously fetched data from JSON
data = []
if os.path.exists("packs.json"):
    with open("packs.json", "r") as f:
        data = json.load(f)

# Define the range of packs to fetch
missing_packs = [f"S{x}" for x in range(1514,1520)] #requires a bit of edit

# Fetch beatmap packs
for pack_name in missing_packs:
    try:
        # Check if pack has already been processed
        if pack_name in [d['packName'] for d in data]:
            continue

        # Fetch pack information using the pack name
        pack = client.beatmap_pack(pack_name)

        beatmaps = []
        for beatmapset in pack.beatmapsets:
            for beatmap in client.beatmapset(beatmapset.id).beatmaps:
                if beatmap.mode_int != 0:  # Only include osu!standard mode (mode_int == 0)
                    continue
                beatmaps.append({
                    'beatmap_id': beatmap.id,
                    'time_duration_seconds': beatmap.hit_length
                })

        # Append fetched pack data to the list
        data.append({
            "packName": pack.tag,
            "beatmaps": beatmaps,
            "timestamp": datetime.fromisoformat(pack.date).timestamp()
        })

        print(f"Added pack {pack.tag}")

        # Sort the data by timestamp (newest first)
        data.sort(key=lambda x: x['timestamp'], reverse=True)

        # Write updated data to JSON
        with open("packs.json", "w") as f:
            json.dump(data, f, indent=4)

        # Avoid spamming API requests
        time.sleep(0.5)

    except ossapi.exceptions.OssapiException as e:
        print(f"Error fetching pack {pack_name}: {str(e)}")
        continue