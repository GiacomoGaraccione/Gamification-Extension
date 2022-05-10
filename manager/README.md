# TODO

## Users

- Cliccare su un utente nella tabella dovrebbe evidenziarlo

## Leaderboards

## Achievements/Avatars

- Mostrare in ordine decrescente la percentuale di ottenimento di ciascuno

SELECT idAch,COUNT(\*) as count
FROM UserAchievements
GROUP BY idAch
ORDER BY count DESC;
