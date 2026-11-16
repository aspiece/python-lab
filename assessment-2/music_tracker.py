# Playlist DJ
# Read README.md for instructions.
name = input("DJ name: ").strip()
songs = ["Pixel Beat", "Night Drive", "Game On"]
ratings = [5, 3, 5]
favorites = 0

for index in range(3):
    rating = ratings[index]
    # TODO 1: Update favorites for a rating of 5.

    # TODO 2: Write if, elif, else to set label.
    label = ""

    print(songs[index], "-", label)

print("DJ:", name)
print("Favorites:", favorites)
