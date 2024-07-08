from gensim.models import KeyedVectors
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd


class ContextoGame:
    def __init__(self, model_path, lemmatized_words_path):
        self.model = KeyedVectors.load(model_path)
        self.lemmatized_words_df = pd.read_csv(lemmatized_words_path)
        self.lemmatized_words = self.lemmatized_words_df['word'].tolist()
        self.ranked_list = []

    def get_similarity(self, word1, word2):
        if word1 in self.model and word2 in self.model:
            return cosine_similarity([self.model[word1]], [self.model[word2]])[0][0]
        else:
            return 0.0  # Return 0 similarity if one of the words is not in the model

    def create_ranked_list(self, solution_word):
        if solution_word not in self.model:
            raise ValueError(f"The solution word '{solution_word}' is not in the model.")

        # Calculate similarities and sort the list
        similarities = []
        for word in self.lemmatized_words:
            similarity = self.get_similarity(solution_word, word)
            similarities.append((word, similarity))

        # Sort words by similarity in descending order
        self.ranked_list = sorted(similarities, key=lambda x: x[1], reverse=True)

        return self.ranked_list

    def get_similarity_rank(self, input_word):
        # Find the word in the ranked list and return its rank
        for rank, (word, _) in enumerate(self.ranked_list):
            if word == input_word:
                return rank + 1  # Rank starts from 1

        return -1  # Return -1 if the word is not found in the ranked list
