import os
import re

import openai
from django.http import JsonResponse
from django.shortcuts import render
from dotenv import load_dotenv

load_dotenv()


def extract_completed_words(predictions):
    completed_words = []
    for prediction in predictions:
        words = re.findall(r'\b[^\d\W]+\b', prediction)
        completed_words.extend(words[1:])
    return completed_words


def home(request):
    return render(request, 'home.html')


def generate_predictions(request):
    try:
        if request.method == 'POST':
            user_input = request.POST.get('user_input', '')
            print(user_input)
            openai.api_key = os.getenv('API_KEY')
            prompt = f"""According to this text, please give me only 5 predictions for the continuation of the last word
            Text: "{user_input}"
            Expected output:
            1.
            2.
            3.
            4.
            5.
            """

            completions = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
            ).choices

            predictions = [completion["message"]["content"] for completion in completions]

            completed_words = extract_completed_words(predictions)

            completed_words = list(set(completed_words))  # Remove duplicate words

            for word in user_input.split():
                completed_words = [w for w in completed_words if w.lower() != word.lower()]  # Remove words from the user input

            print(completed_words)
            return JsonResponse({'completed_words': completed_words})

        else:
            return JsonResponse({'error': 'Invalid request method'}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
