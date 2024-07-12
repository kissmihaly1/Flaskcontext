from gensim.models import KeyedVectors
import numpy as np
import pandas as pd
import re


class ContextoGame:
    def __init__(self, model_path, lemmatized_words_path):
        self.model = KeyedVectors.load_word2vec_format(model_path, limit=300000)
        self.lemmatized_words_df = pd.read_csv(lemmatized_words_path)
        self.lemmatized_words = list(set(self.lemmatized_words_df['lemma'].str.lower().tolist()))
        self.ranked_list = []
        self.hints = 0

    def get_similarity(self, word1, word2):
        if word1 in self.model and word2 in self.model:
            vector1 = self.model[word1]
            vector2 = self.model[word2]
            dot_product = np.dot(vector1, vector2)
            norm1 = np.linalg.norm(vector1)
            norm2 = np.linalg.norm(vector2)
            return dot_product / (norm1 * norm2)
        else:
            return 0.0

    def create_ranked_list(self, solution_word):
        if solution_word not in self.model:
            raise ValueError(f"The solution word '{solution_word}' is not in the model.")
        similarities = []
        for word in self.lemmatized_words:
            if word in self.model:
                if isinstance(word, str):
                    if re.search(r'[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]', word):
                        continue
                    similarity = self.model.similarity(solution_word, word)
                    similarities.append((word, similarity))

        self.ranked_list = sorted(similarities, key=lambda x: x[1], reverse=True)
        self.save_list_to_txt(self.ranked_list, 'ranked_list4.txt')
        return self.ranked_list

    def get_similarity_rank(self, input_word):
        for rank, (word, _) in enumerate(self.ranked_list):
            if word == input_word:
                return rank + 1

        return -1

    def get_hint(self, rank):
        if rank > 200:
            return self.ranked_list[199][0], 200
        elif rank > 100:
            return self.ranked_list[99][0], 100
        elif rank > 50:
            return self.ranked_list[49][0], 50
        elif rank > 25:
            return self.ranked_list[24][0], 25
        elif rank > 12:
            return self.ranked_list[11][0], 12
        elif rank > 8:
            return self.ranked_list[7][0], 8
        elif rank > 5:
            return self.ranked_list[4][0], 5
        elif rank > 2:
            return self.ranked_list[1][0], 2
        else:
            return None, None

    def save_list_to_txt(self, lst, filename):
        with open(filename, 'w') as file:
            for item in lst:
                file.write(f"{item}\n")

