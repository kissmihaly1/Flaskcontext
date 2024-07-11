import pandas as pd
from gensim.models import KeyedVectors
import stanza


def lemmatiz_words():
    print("bejött")
    model = KeyedVectors.load_word2vec_format('model/w2vhun.w2v', limit=150000)
    nlp = stanza.Pipeline('hu')
    words = list(model.index_to_key)

    lemmatized_words = [lemmatize(word, nlp) for word in words]

    df = pd.DataFrame({'word': words, 'lemma': lemmatized_words})
    df.to_csv('lemmatized_words2.csv', index=False)

    print("Lemmatization complete and CSV file saved.")

def lemmatize(word, nlp):
    doc = nlp(word)
    for sentence in doc.sentences:
        for word in sentence.words:
            return word.lemma

