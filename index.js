import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import App from './modules/App'
import Results from './modules/Results'
import Home from './modules/Home'
import ReactGA from 'react-ga'

ReactGA.initialize('UA-83357654-1')

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}
render((
  <Router history={browserHistory} onUpdate={logPageView}>
    <Route path="/" component={App}>
      <IndexRoute  component={Home}/>
      <Route path="/results(/:searchString)" component={Results}/>
    </Route>
  </Router>
), document.getElementById('app'))
