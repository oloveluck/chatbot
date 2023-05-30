from dotenv.main import load_dotenv
import os
from datasets import load_dataset
from langchain.embeddings.openai import OpenAIEmbeddings
import pinecone
import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import TextSplitter
import argparse
from tqdm.auto import tqdm
from uuid import uuid4

tiktoken.encoding_for_model('gpt-3.5-turbo')
load_dotenv()
tokenizer = tiktoken.get_encoding('cl100k_base')
model_name = 'text-embedding-ada-002'
# find API key in console at app.pinecone.io
PINECONE_API_KEY = os.environ['PINECONE_API_KEY']
# find ENV (cloud region) next to API key in console
PINECONE_ENV = os.environ['PINECONE_API_REGION']
index_name = 'langchain-retrieval-augmentation'


def tiktoken_len(text):
    tokens = tokenizer.encode(
        text,
        disallowed_special=()
    )
    return len(tokens)


def store_embeddings(index: pinecone.Index, text_splitter: TextSplitter, data):
    embed = OpenAIEmbeddings(
        model=model_name,
        openai_api_key=os.environ['OPENAI_API_KEY'])

    batch_limit = 100

    texts = []
    metadatas = []

    for i, record in enumerate(tqdm(data)):
        # first get metadata fields for this record
        metadata = {
            'wiki-id': str(record['id']),
            'source': record['url'],
            'title': record['title']
        }
        # now we create chunks from the record text
        record_texts = text_splitter.split_text(record['text'])
        # create individual metadata dicts for each chunk
        record_metadatas = [{
            "chunk": j, "text": text, **metadata
        } for j, text in enumerate(record_texts)]
        # append these to current batches
        texts.extend(record_texts)
        metadatas.extend(record_metadatas)
        # if we have reached the batch_limit we can add texts
        if len(texts) >= batch_limit:
            ids = [str(uuid4()) for _ in range(len(texts))]
            embeds = embed.embed_documents(texts)
            index.upsert(vectors=zip(ids, embeds, metadatas))
            texts = []
            metadatas = []

    if len(texts) > 0:
        ids = [str(uuid4()) for _ in range(len(texts))]
        embeds = embed.embed_documents(texts)
        index.upsert(vectors=zip(ids, embeds, metadatas))


def __main__():
    parser = argparse.ArgumentParser(description='Description of your program.'
                                     )
    parser.add_argument('namespace', type=str,
                        help='the namespace in pinecone')
    parser.add_argument('data_name', type=str,
                        help='the name for huggingface dataset')
    parser.add_argument('data_path', type=str,
                        help='the path for huggingface dataset')
    args = parser.parse_args()
    data = load_dataset(args.data_path, args.data_name, split='train[:10000]') 
    # "wikipedia", "20220301.simple"
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=20,
        length_function=tiktoken_len,
        separators=["\n\n", "\n\t", "\n", " ", ""]
    )

    pinecone.init(
            api_key=PINECONE_API_KEY,
            environment=PINECONE_ENV)
    if index_name not in pinecone.list_indexes():
        # we create a new index
        pinecone.create_index(
            name=index_name,
            metric='cosine',
            dimension=1536  # 1536 dim of text-embedding-ada-002
        )
    index = pinecone.Index(index_name)
    print(index.describe_index_stats())
    store_embeddings(index, text_splitter, data)


__main__()
