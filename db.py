import os
from cloudant.design_document import DesignDocument
from cloudant.client import CouchDB
from cloudant.view import View
from cloudant.error import CloudantClientException

vote_map = """\
function(doc) {
   if(doc.pollID && doc.votes) {
      emit(doc.pollID, {
         pollID: doc.pollID,
         votes: doc.votes
      });
   }
}
"""

client = CouchDB(None, None, url='http://' + os.environ['DB_NAME'] + ':5984', admin_party=True, connect=True)
try:
   couch = client.create_database(dbname=os.environ['DB_NAME'], throw_on_exists=True)
except CloudantClientException:
   couch = client[os.environ['DB_NAME']]

ddoc = DesignDocument(couch, '_design/' + os.environ['DB_NAME'])
ddoc.add_view(os.environ['DB_NAME'], vote_map)
if ddoc.exists() is not True: ddoc.save()
vote_view = View(ddoc, os.environ['DB_NAME'])
