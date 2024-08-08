from gensim.models import KeyedVectors
import numpy as np
import pandas as pd
import re


class ContextoGame:
    def __init__(self, model_path):
        self.model = KeyedVectors.load_word2vec_format(model_path, limit=300000)
        with open('lemmatizedwords.txt', 'r', encoding='utf-8') as file:
            self.lemmatized_words = list(set(word.lower().strip() for word in file))
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

    def create_ranked_list(self, solution_word, day):
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
        self.save_list_to_txt(self.ranked_list, f'ranked_list{day}.txt')
        self.model = None
        return self.ranked_list

    def get_similarity_rank(self, input_word, day):
        try:
            filename = f'words/ranked_list{day}.txt'
            ranked_list = []
            with open(filename, 'r', encoding='utf-8') as file:
                for line in file:
                    item = eval(line.strip())
                    ranked_list.append(item)
            for index, item in enumerate(ranked_list):
                if item[0] == input_word:
                    return index+1

            return -1
        except FileNotFoundError:
            print(f"File {filename} not found.")
            return -1
        except Exception as e:
            print(f"An error occurred: {e}")
            return -1

    def get_hint(self, rank, day):
        filename = f'words/ranked_list{day}.txt'
        ranked_list = []
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                item = eval(line.strip())
                ranked_list.append(item)

        if 1000 <= rank <= 5000:
            result = rank - int(rank * 0.4)
        elif 100 <= rank < 1000:
            result = rank - int(rank * 0.35)
        elif 10 <= rank < 100:
            result = rank - int(rank * 0.3)
        elif 3 < rank < 10:
            result = rank - int(rank * 0.5)
        elif rank == 3:
            result = 1
        elif rank == 2:
            return None, None
        else:
            result = rank - int(rank * 0.4)
        return ranked_list[result][0], result+1

    def save_list_to_txt(self, lst, filename):
        with open(f'words/{filename}', 'w') as file:
            for item in lst:
                file.write(f"{item}\n")
