var polls = JSON.parse(localStorage.getItem('polls')) || [];
var voted = JSON.parse(localStorage.getItem('voted')) || [];

function getDefaults() {
   return {
      origin: window.location.origin,
      isMultiSelect: false,
      question: '',
      choices: [{choice: ''}, {choice: ''}, {choice: ''}],
      polls: polls,
      hasVoted: false,
      votes: [],
      resultsChart: {
         options: {
            plotOptions: {
               bar: {horizontal: true}
            },
            dataLabels: {enabled: false},
            xaxis: {
               type: 'category',
               labels: {
                  show: false
               },
               axisTicks: {
                  show: false
               },
               categories: []
            }
         },
         series: [{data: []}]
      }
   }
};

const index = Vue.component('index', {
  template: '#index',
  data: function () {
     return getDefaults();
  },
  methods: {
     keyup: function(evt) {
        if (evt.currentTarget.id == this.$data.choices.length - 1) {
           this.$data.choices.push({choice: ''});
        }
     },
     surveySubmit: function() {
        axios.post('/create', {
           isMultiSelect: this.isMultiSelect,
           question: this.question,
           choices: this.choices.filter(item => item.choice.length)
        }).then((response) => {
           polls.push(response.data);
           localStorage.setItem('polls', JSON.stringify(polls));
           Object.assign(this.$data, getDefaults());
        });
     }
  }
});

const poll = Vue.component('poll', {
   template: '#poll',
   data: function() {
      return getDefaults();
   },
   created() {
      this.hasVoted = voted.indexOf(this.$route.params.id) !== -1;
      axios.get('/poll/' + this.$route.params.id).then((response) => {
         Object.assign(this.$data, response.data);
         this.resultsChart.options.xaxis.categories = this.choices.map((item) => item.choice);
      }).then(() => {
         if (this.hasVoted) this.getResults();
      });
   },
   methods: {
      voteSubmit: function() {
         axios.post('/poll/' + this.$data._id, {
            votes: Array.isArray(this.votes) ? this.votes : [this.votes]
         }).then(() => {
            voted.push(this.$data._id);
            localStorage.setItem('voted', JSON.stringify(voted));
            this.hasVoted = true;
            this.getResults();
         });
      },
      getResults: function() {
         axios.get('/results/' + this.$route.params.id).then((response) => {
            this.resultsChart.series[0].data = this.choices.map((item, index) => response.data[index] ? response.data[index] : 0);
         });
      }
   }
});

const router = new VueRouter({
   routes: [{path: '/', component: index}, {path: '/poll/:id', component: poll}]
});

Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
new Vue({router, el: '#app'}).$mount('#app');
