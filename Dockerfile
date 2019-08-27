FROM python:latest

COPY . .

ENV DB_NAME=pilpolldb
RUN pip3 install cloudant==2.12.0
RUN pip3 install flask==1.1.1

CMD ["python", "./api.py"]
