from flask import Flask, request, jsonify, render_template
from get_context_number import ContextoGame
app = Flask(__name__)

contexto_game = ContextoGame('model/glove-hu_152.gensim', 'lemmatized_words.csv')

contexto_game.create_ranked_list('kacsa')

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
        return jsonify({"error": "No word provided"}), 400

    rank = contexto_game.get_similarity_rank(input_word)
    if rank == -1:
        return jsonify({"error": f"The word '{input_word}' is not found in the ranked list"}), 404

    return jsonify({"word": input_word, "rank": rank})


if __name__ == '__main__':
    app.run(debug=True)


#                    let guessesCount = document.getElementById('guesses-count');
         #           guessesCount.innerText = parseInt(guessesCount.innerText) + 1;