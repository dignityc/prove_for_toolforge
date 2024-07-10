from flask import Flask, render_template_string, render_template, request, jsonify
import re
import pickle
import pandas as pd
import stats_calculator 

app = Flask(__name__)

with open('wikidata_stats.pickle', 'rb') as f:
    data = pickle.load(f)


label_to_id = {data[item]['entity']['label']: item for item in data if 'entity' in data[item] and 'label' in data[item]['entity']}
pairs = [f"{label} ({Qid})" for label, Qid in label_to_id.items()]
#print(label_to_id)

def serialize_data(obj):
    if isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient='records')
    elif isinstance(obj, pd.Series):
        return obj.to_dict()
    elif isinstance(obj, dict):
        return {k: serialize_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_data(item) for item in obj]
    else:
        return obj


@app.route('/')
def index():
    return render_template('index.html', labels=label_to_id.keys(), Qids=label_to_id.values())

@app.route('/search')
def search():
    query = request.args.get('query', '').lower() 
    #print(query)
    #matched_labels = [label for label in label_to_id if query in label.lower()]
    matched_labels = [pair for pair in pairs if query in pair.lower()]
    #print(matched_labels)
    matched_labels = matched_labels[:15]
    return jsonify(matched_labels)

@app.route('/toWikiPage')
def toWikiPage():
    label = request.args.get('label', '')
    label = re.sub(r' \([^)]*\)', '', label)
    Qid = label_to_id.get(label)
    return Qid

@app.route('/random')
def random_select():
    import random
    item_id = random.choice(list(data.keys()))
    label = serialize_data(data[item_id]['entity']['label'])
    pair = f"{data[item_id]['entity']['label']} ({item_id})"
    statics = stats_calculator.stats(data[item_id]['entity'])[1]
    result_values = [data[item_id]['entity']['label']]
    result_values += stats_calculator.stats(data[item_id]['entity'])[0]
    result_values += stats_calculator.entailmentResult(data[item_id]['result'])
    html_content = stats_calculator.format_to_html(result_values)
    postdata = {'Qid':item_id, 'label': label, 'pair': pair, 'statics':statics, 'html_content': html_content}
    return postdata

@app.route('/get_data')
def get_data():
    label = request.args.get('label', '')
    label = re.sub(r' \([^)]*\)', '', label)
    item_id = label_to_id.get(label)
    if item_id and item_id in data:
        label = serialize_data(data[item_id]['entity']['label'])
        pair = f"{data[item_id]['entity']['label']} ({item_id})"
        result_values = [data[item_id]['entity']['label']]
        print(result_values)
        statics = stats_calculator.stats(data[item_id]['entity'])[1]
        print(statics)
        result_values += stats_calculator.stats(data[item_id]['entity'])[0]
        support = stats_calculator.entailmentResult(data[item_id]['result'])
        #print(support)
        result_values += support
        html_content = stats_calculator.format_to_html(result_values)
        postdata = {'Qid':item_id, 'label': label, 'pair': pair, 'statics': statics,'html_content': html_content}
        return postdata
    return jsonify({'error': 'Data not found'})





if __name__ == '__main__':
    app.run(debug=True)