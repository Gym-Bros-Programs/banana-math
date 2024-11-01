max_number = 100
csv_file = "additions.csv"


for x in range (max_number):
    for y in range (max_number):
        print(f"{x},+,{y},{x+y}")
        with open(csv_file, "a") as file:
            file.write(f"{x},+,{y},{x+y}\n")