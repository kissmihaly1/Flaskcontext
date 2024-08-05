import time
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from get_context_number import ContextoGame
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import certifi
from datetime import datetime
load_dotenv()

app = Flask(__name__)

day = os.getenv("GAMEDAY")
contexto_game = ContextoGame('model/w2vhun.w2v', 'lemmatizedwords.txt')
solution_word = os.getenv('SOLUTION_WORD')
contexto_game.create_ranked_list(solution_word, day)

mongodb = os.getenv('MONGODB')
client = MongoClient(mongodb, tlsCAFile=certifi.where())
db = client['contextodb']
guesses_collection = db['guesses']


def save_guess(word, rank, user_id=None):
    if word and rank is not None:
        guess_data = {
            'word': word,
            'rank': rank,
            'user_id': user_id,
            'timestamp': datetime.now()
        }
        guesses_collection.insert_one(guess_data)
        return jsonify({'status': 'success'}), 200
    return jsonify({'error': 'Valami hiba történt, próbáld meg később!'}), 400


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')



@app.route('/checkdate', methods=['POST'])
def checkdate():
    day = os.getenv("GAMEDAY")
    return jsonify({"day": day})



@app.route('/guess', methods=['POST'])
def process():
    data = request.json
    input_word = data.get('word')
    day = data.get('day')
    if not input_word:
        return jsonify({"error": "Nem lett szó beírva!"}), 400

    rank = contexto_game.get_similarity_rank(input_word, day)
    if rank == -1:
        return jsonify({"error": f"Ez a szó ('{input_word}') nincs a szavak között!"}), 404
    response, status_code = save_guess(input_word, rank)
    if status_code == 400:
        return jsonify({"error": "Valami hiba történt, próbáld meg később!"}), 400
    return jsonify({"word": input_word, "rank": rank})


@app.route('/hint', methods=['POST'])
def hint():
    data = request.json
    best_rank = data.get('best_rank')
    day = data.get('day')

    if not best_rank:
        return jsonify({"error": "Nem lett szó beírva!"}), 400
    word, rank = contexto_game.get_hint(best_rank, day)
    if word is None:
        return jsonify({"error": "Már megtaláltad a legközelebbi szót!"}), 400

    return jsonify({"word": word, "rank": rank})


@app.route('/giveup', methods=['POST'])
def giveup():
    data = request.json
    day = data.get('day')
    filename = f'words/ranked_list{day}.txt'
    ranked_list = []
    i = 0
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            item = eval(line.strip())
            ranked_list.append(item)
            i+=1
            if i >= 2:
                break
    solution_word = ranked_list[0][0]
    return jsonify({'solution_word': solution_word})

@app.route('/closestWords', methods=['POST'])
def closesWords():
    data = request.json
    day = data.get('day')
    filename = f'words/ranked_list{day}.txt'
    ranked_list = []
    i = 0
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            item = eval(line.strip())
            ranked_list.append(item[0])
            i+=1
            if i >= 500:
                break

    return jsonify({'solution_words': ranked_list})




if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
