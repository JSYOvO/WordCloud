import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    fab : {
        position : 'fixed',
        botton : '20px',
        right: '20px'
    }
})

const databaseUrl = "https://wordcloud-4f968.firebaseio.com/";

class Words extends React.Component {
    constructor(){
        super();
        this.state = {
            words : {},
            dialog : false,
            word : '',
            weight : ''
        }
    }

    _get(){
        fetch(`${databaseUrl}/words.json`).then(res => {
            if(res.status !== 200) throw Error(res.statusText);
            return res.json();
        }).then(words => this.setState({words : words}))
    }

    _post(word){
        return fetch(`${databaseUrl}/words.json`, {
            method : 'POST',
            body : JSON.stringify(word)
        }).then(res => {
            if(res.status != 200){
                throw new Error(res.statusText);            
            }
            return res.json();
        }).then(data => {
            let nextState = this.state.words;
            nextState[data.name] = word;
            this.setState({
                words : nextState
            })
        })
    }
    _delete(id){
        return fetch(`${databaseUrl}/words/${id}.json`, {
            method : 'DELETE'
        }).then(res => {
            if(res.status !== 200){throw Error(res.statusText)}
            return res.json();
        }).then(() => {
            let nextState = this.state.words;
            delete nextState[id];
            this.setState({words : nextState});
        })
    }

    componentDidMount(){
        this._get();
    }

    handleDialogToggle = () => this.setState({
        dialog : !this.state.dialog
    })

    handelValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    handleSubmit = () => {
        const word = {
            word : this.state.word,
            weight : this.state.weight
        }
        this.handleDialogToggle();
        if(!word.word && !word.weight) return;
        this._post(word);
    }

    handleDelete = (id) => {
        this._delete(id);
    }

    render() {
        const {classes} = this.props;
        return (
            <div>
                {Object.keys(this.state.words).map(id => {
                    const word = this.state.words[id];
                    return (
                        <div key = {id}>
                            <Card>
                                <CardContent>
                                    <Typography color = "textSecondary" gutterBottom>
                                        가중치 : {word.weight}
                                    </Typography>
                                    <Grid container>
                                        <Grid item xs = {6}>
                                            <Typography variant = "h5" component = "h2">
                                                {word.word}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs = {6}>
                                            <Button variant="contained" color="primary" onClick = {() => this.handleDelete(id)}> 삭제 </Button>
                                        </Grid>
                                    </Grid>
           
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
                <Fab color = "primary" className = {classes.fab} onClick={this.handleDialogToggle}>
                    <AddIcon/>
                </Fab>
                <Dialog open={this.state.dialog} onClose={this.handleDialogToggle}>
                    <DialogTitle>단어 추가</DialogTitle>
                    <DialogContent>
                        <TextField label="단어" type="text" name="word" value={this.state.word} onChange={this.handelValueChange}/> <br/>
                        <TextField label="가중치" type="text" name="weight" value={this.state.weight} onChange={this.handelValueChange}/> <br/>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={this.handleSubmit}>추가</Button>
                        <Button variant="outlined" color="primary" onClick={this.handleDialogToggle}>닫기</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default withStyles(styles)(Words);