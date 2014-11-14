/** @jsx React.DOM */
var moment = require('moment');
var React = require('react');
var ReactFireMixin = require('reactfire');
var Firebase = require('firebase');
var _ = require('underscore');
var $ = require('jquery');

var Helpers = {
  formatDate: function(date) {
    return moment(date, "YYYY-MM-DD").format("MM/DD");
  },
  formatAmount: function(amount, negative) {
    if (negative) {
      return "$" + amount.toFixed(2);
    } else {
      return "$" + (0 - amount).toFixed(2);
    }
    
  },
  budgetColorClass: function(total, budget) {
    var CLASSES = ["budget-negative", "budget-over", "budget-near",
      "budget-half", "budget-low"];
    var total = (0 - total);
    if (total < 0) {
      return CLASSES[0];
    } else if (total > budget) {
      return CLASSES[1];
    } else if (total > (budget * .75)) {
      return CLASSES[2];
    } else if (total > (budget * .5)) {
      return CLASSES[3];
    } else {
      return CLASSES[4];
    }

  },
  txnColorClass: function(amount, cat) {
    var CLASSES = ["positive-amonut", "negative-amount"];
    var NA = "N/A";
    return (amount > 0 || cat == NA) ? CLASSES[0] : CLASSES[1];
  }
};

var Cat = React.createClass({
  filteredTxns: function() {
    return this.props.txns.filter(_.bind(function(txn) {
      return (txn.cat == this.props.cat.title);
    }, this));
  },

  sum: function(filteredTxns) {
    var total = 0;
    for (var i = 0; i < filteredTxns.length; i++) {
      total += filteredTxns[i].amount;
    }
    return total;
  },

  render: function() {
    var cat = this.props.cat;
    var total = this.sum(this.filteredTxns());
    return (
      <tr className={Helpers.budgetColorClass(total, cat.budget)}>
        <td>{ cat.title }</td>
        <td>{Helpers.formatAmount(total)} / {Helpers.formatAmount(cat.budget, true)}</td>
      </tr>
      );
  }
});

var CatList = React.createClass({
  getInitialState: function() {
    return {
      hidden: false
    };
  },

  filteredCats: function() {
    return this.props.cats.filter(_.bind(function(element){
      return (element.title !== "N/A") || this.state.hidden;
    }, this));
  },

  onToggle: function(e) {
    this.setState({hidden: e.target.checked})
  },  

  render: function() {
    return (
      <section className="categories">
        <SectionHeader title="Bougette" toggleText="Show hidden" onToggle={ this.onToggle }/>
        <table>
          <tbody>
            { this.filteredCats().map(_.bind(function(cat){
              return <Cat cat={ cat } txns={ this.props.txns} />;
            }, this)) }
          </tbody>
        </table>
      </section>
      );
  }
});

var SectionHeader = React.createClass({
  render: function() {
    return (
      <form className="pure-form">
        <fieldset>
          <strong>{this.props.title}</strong>
          <label className="toggle" htmlFor={"checkbox-"+this.props.title.toLowerCase()}>
            <input id={"checkbox-"+this.props.title.toLowerCase()} onChange={ this.props.onToggle } type="checkbox" /> {this.props.toggleText}
          </label>
        </fieldset>
      </form>
      );
  }
});

var Txn = React.createClass({
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

  render: function() {
    var txn = this.props.txn;
    if (txn.cat) {
      var catCol = (
        <td>
          { txn.cat }&nbsp;<a onClick={ this.removeCat } href="#">×</a>
        </td>
        );
    } else {
      var catCol = (
        <td>
          {this.props.cats.map(_.bind(function(cat) {
            return <span><a onClick={ this.addCat } href="#">{ cat.title}</a> </span>;
          }, this))}
        </td>
        );
    }
    return (
      <tr className={Helpers.txnColorClass(txn.amount, txn.cat)} data-hash={ txn.hash }>
        <td>{ Helpers.formatDate(txn.date) }</td>
        <td>{ txn.name }</td>
        <td>{ Helpers.formatAmount(txn.amount) }</td>
        {catCol}
      </tr>
      );
  }
});

var TxnList = React.createClass({
  getInitialState: function() {
    return {
      all: false
    };
  },

  sortedTxns: function() {
    return this.props.txns.sort(function(a, b) {
        if (a.date == b.date) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        }
        return new Date(a.date) - new Date(b.date);
      });
  },

  filteredTxns: function() {
    if (this.state.all) {
      return this.sortedTxns();
    } else {
      return this.sortedTxns().filter(function(txn) {
        return (txn.cat == null);
      });
    }
  },

  onToggle: function(e) {
    this.setState({all: e.target.checked})
  },

  render: function() {
    return (
      <section className="transactions">
        <SectionHeader title="Transactions" toggleText="Show all" onToggle={ this.onToggle }/>
        <table>
          <tbody>
            { this.filteredTxns().map(function(txn){
              return <Txn txn={ txn }/>;
            }) }
          </tbody>
        </table>
      </section>
      );
  }
});

var Error = React.createClass({
  render: function() {
    if (this.props.error) {
      return <span className="error">Login error. Please try again.</span>;
    } else {
      return <span></span>
    }
  }
});

var Login = React.createClass({
  getInitialState: function() {
    return {
      error: false
    }
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.props.login(
      $("#email-input").val(),
      $("#password-input").val(),
      function(){},
      _.bind(function() {
        this.setState({error: true});
      }, this)
      );
  },

  render: function() {
    return (
      <section className="login">
        <form className="login pure-form" onSubmit={ this.onSubmit }>
          <fieldset>
            <input id="email-input" type="email" placeholder="Email"></input>
            <input id="password-input" type="password" placeholder="Password"></input>
            <button type="submit">Submit</button>
            <a onClick={ this.onSubmit } href="#">Submit</a>
          </fieldset>
        </form>
        <Error error={ this.state.error }/>
      </section>
      );
  }
});

var BougetteApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      txns: [],
      cats: [],
      loggedIn: !!this.props.fireRef.getAuth()
    };
  },

  bindData: function() {
    var txnRef = this.props.fireRef.child('txns');
    var catRef = this.props.fireRef.child('cats');
    var startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
    this.bindAsArray(txnRef.orderByChild("date").startAt(startOfMonth), "txns");
    this.bindAsArray(catRef, "cats");
  },

  componentWillMount: function() {
    this.bindData();
  },

  login: function(email, password, cb, err_cb) {
    this.props.fireRef.authWithPassword({
      email: email,
      password: password
    }, _.bind(function(error, authData) {
      if (error === null) {
        this.setState({loggedIn: true});
        this.bindData();
        cb();
      } else {
        console.log(error);
        err_cb(error);
      }
    },this));
  },

  render: function() {
    if (!this.state.loggedIn) {
      return <Login login={ this.login } />;
    } else {
      return (
        <div>
          <CatList txns={ this.state.txns } cats={ this.state.cats} />
          <TxnList txns={ this.state.txns } cats={ this.state.cats }/>
        </div>
      );
  }
  }
});

React.render(<BougetteApp fireRef={ new Firebase("https://bougette.firebaseio.com/") } />, document.getElementById("app"));