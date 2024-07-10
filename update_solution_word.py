import os
import subprocess


def update_solution_word():
    with open('next_day_words.txt', 'r') as file:
        words = file.readlines()

    if not words:
        print("No more words left for the next day.")
        return

    next_word = words[0].strip()

    # Update .env file
    with open('.env', 'w') as env_file:
        env_file.write(f"SOLUTION_WORD={next_word}")

    # Remove the used word from the list
    with open('next_day_words.txt', 'w') as file:
        file.writelines(words[1:])

    print(f"Updated solution word to {next_word}")

    # Restart the application
    subprocess.run(['pkill', 'gunicorn'])
    subprocess.run(['nohup', 'gunicorn', '-w', '2', '-b', '0.0.0.0:8000', 'wsgi:app', '&'], stdout=subprocess.PIPE,
                   stderr=subprocess.PIPE)


if __name__ == "__main__":
    update_solution_word()
