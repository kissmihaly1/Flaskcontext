import streamlit as st
import requests
import os
from dotenv import load_dotenv

load_dotenv()

FLASK_API_URL = 'http://localhost:5000'

st.title('KONTEXTUS')

def main():
    menu = ["Home", "FAQ", "Guess", "Hint", "Give Up"]
    choice = st.sidebar.selectbox("Menu", menu)

    if choice == "Home":
        st.subheader("Home")
        response = requests.get(f"{FLASK_API_URL}/")
        st.write(response.text)

    elif choice == "FAQ":
        st.subheader("FAQ")
        response = requests.get(f"{FLASK_API_URL}/faq")
        st.write(response.text)

    elif choice == "Guess":
        st.subheader("Guess the Word")
        word = st.text_input("Enter a word:")
        if st.button("Submit"):
            if word:
                response = requests.post(f"{FLASK_API_URL}/guess", json={"word": word})
                result = response.json()
                if 'error' in result:
                    st.error(result['error'])
                else:
                    st.success(f"Word: {result['word']}, Rank: {result['rank']}")

    elif choice == "Hint":
        st.subheader("Get a Hint")
        best_rank = st.number_input("Enter your best rank so far:", min_value=1)
        if st.button("Get Hint"):
            response = requests.post(f"{FLASK_API_URL}/hint", json={"best_rank": best_rank})
            result = response.json()
            if 'error' in result:
                st.error(result['error'])
            else:
                st.success(f"Hint Word: {result['word']}, Rank: {result['rank']}")

    elif choice == "Give Up":
        st.subheader("Give Up")
        if st.button("Give Up"):
            response = requests.post(f"{FLASK_API_URL}/giveup")
            result = response.json()
            st.info(f"The solution word was: {result['solution_word']}")

if __name__ == '__main__':
    main()
