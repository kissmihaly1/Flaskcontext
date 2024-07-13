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


contexto_game = ContextoGame('model/w2vhun.w2v', 'lemmatized_words2.csv')
solution_word = os.getenv('SOLUTION_WORD')
contexto_game.create_ranked_list(solution_word)

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
    return jsonify({'error': 'Invalid data'}), 400


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/checkdate', methods=['POST'])
def checkdate():
    day = os.getenv("GAMEDAY")
    return jsonify({"day": day})



@app.route('/guess', methods=['POST'])
def process():
    data = request.json
    input_word = data.get('word')

    if not input_word:
        return jsonify({"error": "Nem lett szó beírva!"}), 400

    rank = contexto_game.get_similarity_rank(input_word)
    if rank == -1:
        return jsonify({"error": f"Ez a szó ('{input_word}') nincs a szavak között!"}), 404
    response, status_code = save_guess(input_word, rank)
    print(response, status_code)
    return jsonify({"word": input_word, "rank": rank})


@app.route('/hint', methods=['POST'])
def hint():
    data = request.json
    best_rank = data.get('best_rank')
    if not best_rank:
        return jsonify({"error": "Nem lett szó beírva!"}), 400
    word, rank = contexto_game.get_hint(best_rank)
    if word is None:
        return jsonify({"error": "Már megtaláltad a legközelebbi szót!"}), 400

    return jsonify({"word": word, "rank": rank})


@app.route('/giveup', methods=['POST'])
def giveup():
    return jsonify({'solution_word': solution_word})


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
