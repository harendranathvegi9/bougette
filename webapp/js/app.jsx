/** @jsx React.DOM */
var CatList = React.createClass({
  getInitialState: function() {
    return {
      hidden: false
    };
  },

  formatBudget: function(total, budget) {
    return (
      <span>
        ${(0 - total).toFixed(2)} / {budget}
      </span>
      );
  },

  color: function(t, budget) {
    var total = (0 - t);
    if (total < 0) {
      return "budget-negative";
    } else if (total > budget) {
      return "budget-over";
    } else if (total > (budget * .75)) {
      return "budget-near";
    } else if (total > (budget * .5)) {
      return "budget-half";
    } else {
      return "budget-low";
    }
  },

  onToggle: function(e) {
    this.setState({hidden: e.target.checked})
  },  

  render: function() {
    var createCat = _.bind(function(cat, index) {
      var filteredTxns = this.props.txns.filter(function(txn) {
        return (txn.cat == cat.title);
      });
      var sum = function(filteredTxns) {
        var total = 0;
        for (var i = 0; i < filteredTxns.length; i++) {
          total += filteredTxns[i].amount;
        }
        return total;
      };
      var total = sum(filteredTxns);
      return (
        <tr className={this.color(total, cat.budget)}>
          <td>{ cat.title }</td>
          <td>{ this.formatBudget(total, cat.budget) }</td>
        </tr>
        );
    }, this);

    return (
      <div>
        <form className="pure-form">
          <fieldset>
            <strong>Budget</strong>
            <label className="toggle" for="checkbox">
              <input id="checkbox" onChange={ this.onToggle } checked={this.state.hidden} type="checkbox"/> Show hidden
            </label>
          </fieldset>
        </form>
        <table>
          <tbody>
            { this.props.cats.filter(_.bind(function(element){
              return (element.title !== "N/A") || this.state.hidden;
            },this)).map(createCat) }
          </tbody>
        </table>
      </div>
      );
  }
});

var TxnList = React.createClass({
  getInitialState: function() {
    return {
      all: false
    };
  },

  sortTxns: function() {
    return this.props.txns.sort(function(a, b) {
        if (a.date == b.date) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        }
        return new Date(a.date) - new Date(b.date);
      });
  },

  filterTxns: function() {
    if (this.state.all) {
      return this.sortTxns();
    } else {
      return this.sortTxns().filter(function(txn) {
        return (txn.cat == null);
      });
    }
  },

  addCat: function(e) {
    e.preventDefault();
    var hash = e.target.parentNode.parentNode.parentNode.dataset.hash;
    var cat = e.target.innerHTML;
    var ref = new Firebase("https://bougette.firebaseio.com/txns/" + hash);
    ref.update({
      cat: cat
    });
  },

  removeCat: function(e) {
    e.preventDefault();
    var hash = e.target.parentNode.parentNode.dataset.hash;
    var ref = new Firebase("https://bougette.firebaseio.com/txns/" + hash);
    ref.update({
      cat: null
    });
  },

  formatDate: function(date) {
    return moment(date, "YYYY-MM-DD").format("MM/DD");
  },

  formatAmount: function(amount) {
    return "$" + (0 - amount).toFixed(2);
  },

  color: function(amount, cat) {
    console.log(amount, cat)
    return (amount > 0 || cat == "N/A") ? "positive-amount" : "";
  },

  onToggle: function(e) {
    this.setState({all: e.target.checked})
  },

  render: function() {
    var createCatLink = _.bind(function(cat, index) {
      return <span><a onClick={ this.addCat } href="#">{ cat.title}</a> </span>;
    }, this);

    var createTxn = _.bind(function(txn, index) {
      if (txn.cat) {
        return (
          <tr className={this.color(txn.amount, txn.cat)} data-hash={ txn.hash }>
            <td>{ this.formatDate(txn.date) }</td>
            <td>{ txn.name }</td>
            <td>{ this.formatAmount(txn.amount) }</td>
            <td>{ txn.cat }&nbsp;<a onClick={ this.removeCat } href="#">×</a></td>
          </tr>
          );
      
      } else {
        return (
          <tr className={this.color(txn.amount, txn.cat)} data-hash={ txn.hash }>
            <td>{ this.formatDate(txn.date) }</td>
            <td>{ txn.name }</td>
            <td>{ this.formatAmount(txn.amount) }</td>
            <td>{this.props.cats.map(createCatLink)}</td>
          </tr>
          );        
      }
    }, this);

    return (
      <div>
        <form className="pure-form">
          <fieldset>
            <strong>Transactions</strong>
            <label className="toggle" for="checkbox">
              <input id="checkbox" onChange={ this.onToggle } type="checkbox" /> Show all
            </label>
          </fieldset>
        </form>
        <table>
          <tbody>
            { this.filterTxns().map(createTxn) }
          </tbody>
        </table>
      </div>
      );
  }
});

var BougetteApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    var ref = new Firebase("https://bougette.firebaseio.com/");
    return {
      txns: [],
      cats: [],
      email: "",
      password: "",
      loggedIn: !!ref.getAuth()
    };
  },

  componentWillMount: function() {
    var txnRef = new Firebase("https://bougette.firebaseio.com/txns/");
    var catRef = new Firebase("https://bougette.firebaseio.com/cats/");
    var startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
    this.bindAsArray(txnRef.orderByChild("date").startAt(startOfMonth), "txns");
    this.bindAsArray(catRef, "cats");
  },

  onEmailChange: function(e) {
    this.setState({
      email: e.target.value
    });
  },

  onPasswordChange: function(e) {
    this.setState({
      password: e.target.value
    });
  },

  onSubmit: function(e) {
    e.preventDefault();
    var ref = new Firebase("https://bougette.firebaseio.com/");
    ref.authWithPassword({
      email    : this.state.email,
      password : this.state.password
    }, _.bind(function(error, authData) {
      if (error === null) {
        this.setState({loggedIn: true});
      } else {
        console.log(error);
      }
    },this));
  },

  render: function() {
    return (
      <div>
        <form className="login pure-form" style={this.state.loggedIn ? {display: "none"} : {}}>
          <fieldset>
            <input onChange={ this.onEmailChange } type="email" placeholder="Email"></input>
            <input onChange={ this.onPasswordChange } type="password" placeholder="Password"></input>
            <a onClick={ this.onSubmit } href="#">Submit</a>
          </fieldset>
        </form>
        <CatList txns={ this.state.txns } cats={ this.state.cats} />
        <br/>
        <br/>
        <TxnList txns={ this.state.txns } cats={ this.state.cats }/>
      </div>
    );
  }
});

React.render(<BougetteApp />, document.getElementById("app"));