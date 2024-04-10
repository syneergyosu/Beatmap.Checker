This project focuses to visually show which beatmap-packs you need to clear and its based per user-id.
Currently it is only made for STD and can be used for Vanilla Or Relax if you get your best-score beatmap_ids and import them into the website.

[hidable completed Beatmap-Packs]
In future, the completed beatmap-packs will be hidable with a button to just see the ones you are supposed to complete, not really sure how it will affect the progress bar yet.

[fetch user_id through api and caching]
Also, based on user input, the best-score-ids will be fetched through api, written to a .txt document and then automatically imported. Also, that file would be saved by cloud and used as cache for future fetching and making it faster by avoiding duplicated and only
getting new best_score_beatmap_ids.

[database???]
Lastly, probably will try to implement a database or use an existing one provided by Adachi if allowed.
