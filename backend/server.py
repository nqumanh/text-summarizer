from flask import Flask, request, jsonify
from transformers import T5Tokenizer, T5ForConditionalGeneration
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
trained_model_path = "./model/"
model = T5ForConditionalGeneration.from_pretrained(trained_model_path)

@app.route('/summarize', methods=['POST'])
def summarize_text():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided for summarization"}), 400

    input_text = "summarize: " + text
    input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)

    # summary_ids = model.generate(
    #     input_ids,
    #     max_length=200,
    #     min_length=100,
    #     do_sample=True,
    #     temperature=0.8,
    #     top_k=50,
    #     top_p=0.95,
    #     num_return_sequences=1,
    #     early_stopping=True
    # )
    summary_ids = model.generate(input_ids, max_length=200, num_beams=4, early_stopping=True)

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(debug=True)
