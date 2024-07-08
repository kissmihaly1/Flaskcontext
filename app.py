from flask import Flask, request, jsonify, render_template
from get_context_number import ContextoGame
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

contexto_game = ContextoGame('model/glove-hu_152.gensim', 'lemmatized_words.csv')
solution_word = 'anya'
contexto_game.create_ranked_list(solution_word)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/faq')
def faq():
    return render_template('faq.html')


@app.route('/guess', methods=['POST'])
def process():
    data = request.json
    input_word = data.get('word')
    if not input_word:
        return jsonify({"error": "Nem lett szó beírva!"}), 400

    rank = contexto_game.get_similarity_rank(input_word)
    if rank == -1:
        return jsonify({"error": f"Ez a szó ('{input_word}') nincs benne a listában!"}), 404

    return jsonify({"word": input_word, "rank": rank})


@app.route('/hint', methods=['POST'])
def hint():
    data = request.json
    best_rank = data.get('best_rank')
    if not best_rank:
        return jsonify({"error": "Nem lett szó beírva!"}), 400
    word, rank = contexto_game.get_hint(best_rank)
    return jsonify({"word": word, "rank": rank})

@app.route('/giveup', methods=['POST'])
def giveup():
    return jsonify({'solution_word': solution_word})


if __name__ == '__main__':
    app.run(debug=True)
