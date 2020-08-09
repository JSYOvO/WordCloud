import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

const theme = createMuiTheme({
    typography : {
        useNextVariants : true,
        fortFamilly : "Noto Sans KR"
    }
})

ReactDOM.render(<MuiThemeProvider theme={theme}><App/></MuiThemeProvider>, document.getElementById('app'));