(function (React, Reflux, NotesActions, UsersActions, NotesStore, UsersStore, global) {
    var Link = ReactRouter.Link;
    var Route = ReactRouter.Route;
    var DefaultRoute = ReactRouter.DefaultRoute;
    var RouteHandler = ReactRouter.RouteHandler;

    var App = React.createClass({
        render: function () {
            var containerStyle = {
                margin: '5px'
            };

            return (
                <div>
                    <header>
                        <ul className="nav nav-tabs">
                            <NavLink to="notes" activeClassName="active">Notes</NavLink>
                            <NavLink to="users" activeClassName="active">Users</NavLink>
                        </ul>
                    </header>
                    <div style={containerStyle}>
                        <RouteHandler/>
                    </div>
                </div>
            );
        }
    });

    var NavLink = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],

        render: function() {
            var className;
            if (this.props.activeClassName && this.isActive(this.props.to, this.props.params, this.props.query)) {
                className = this.props.activeClassName;
            }
            return (
                <li role="presentation" className={className}>
                    <Link activeClassName="" to={this.props.to} params={this.props.params} query={this.props.query} onClick={this.props.onClick}>{this.props.children}</Link>
                </li>
            );
        }
    });

    var NotePage = React.createClass({
        mixins: [Reflux.connect(NotesStore, "list")],
        render: function () {
            return (<div>
                <br/>
                <NoteAdd></NoteAdd>
                <br/>
                <NoteList list={this.state.list}></NoteList>
            </div>
            );
        }
    });

    var UserPage = React.createClass({
        mixins: [Reflux.connect(UsersStore, "list")],
        render: function () {
            return (
                <div>
                    <UserAdd></UserAdd>
                    <br/>
                    <UserList list={this.state.list}></UserList>
                </div>
            );
        }
    });

    var UserAdd = React.createClass({

        handleNewUser: function (evnt) {
            var user = evnt.target.value;
            if (evnt.which === 13 && user) {
                UsersActions.addUser(user);
                evnt.target.value = '';
            }
        },

        render: function () {
            var txtStyle = {
                width: '350px'
            };
            return (
                <div id="addUser">
                    <input type="text" style={txtStyle} className="form-control" placeholder="Some new user" onKeyUp={this.handleNewUser}/>
                </div>
            );
        }
    });

    var UserList = React.createClass({
        propTypes: {
            list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
        },
        render: function () {
            return (
                <table id="user-table" className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Default</th>
                        </tr>
                    </thead>
                    <tbody>
                {this.props.list.map(function (user) {
                    return <UserItem user={user} key={user.key}/>;
                })
                    }
                    </tbody>
                </table>
            )
        }
    });

    var UserItem = React.createClass({
        render: function () {
            return (
                <tr>
                    <td>{this.props.user.name}</td>
                    <td>
                    {this.props.user.selected.toString()}
                    </td>
                </tr>
            );
        }
    });


    var NoteAdd = React.createClass({
        handleNewNote: function (evnt) {
            var note = evnt.target.value;
            if (evnt.which === 13 && note) {
                NotesActions.addNote(note);
                evnt.target.value = '';
            }
        },

        render: function () {
            var txtStyle = {
                width: '350px'
            };
            return (
                <div id="addNote" className="container">
                    <div className="row">
                        <span className="col-md-6">
                            <UserSelect></UserSelect>
                        </span>
                        <span className="col-md-6">
                            <input type="text" style={txtStyle} className="form-control" placeholder="Some important note" onKeyUp={this.handleNewNote}/>
                        </span>
                    </div>
                </div>
            );
        }
    });

    var UserSelect = React.createClass({
        mixins: [Reflux.connect(UsersStore, "list")],

        handleUserSelect: function (evnt) {
            UsersActions.setCurrentUser(evnt.target.value);
        },

        render: function () {
            // the default value for the <select> (selected for ReactJS)
            // http://facebook.github.io/react/docs/forms.html#why-select-value
            var defaultValue;

            var options = this.state.list.map(function (opt, i) {
                // if this is the selected option, set the <select>'s defaultValue
                if (opt.selected === true) {
                    // if the <select> is a multiple, push the values
                    // to an array
                    defaultValue = opt.key;
                }

                // attribute schema matches <option> spec; http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.6
                // EXCEPT for 'key' attribute which is requested by ReactJS
                return <option key={i} value={opt.key} label={opt.name}>{opt.name}</option>;
            }, this);

            return <select
                defaultValue={defaultValue}
                name='userPicker'
                className='form-control'
                onChange={this.handleUserSelect}
            >
        				{options}
            </select>;
        }
    });

    var NoteList = React.createClass({
        propTypes: {
            list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
        },
        render: function () {
            return (
                <table id="note-table" className="table table-striped">
                    <thead>
                        <tr>
                            <th>Submitted By</th>
                            <th>Note</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.props.list.map(function (note) {
                        return <NoteItem note={note} key={note.key}/>;
                    })
                        }
                    </tbody>
                </table>

            )
        }
    });

    var NoteItem = React.createClass({
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            return {isEditing: false};
        },
        editItem: function (evt) {
            this.setState({
                isEditing: true,
                editValue: this.props.note.text
            }, function () {
                this.refs.editInput.getDOMNode().focus();
            });
        },
        handleValueChange: function (evt) {
            var text = this.state.editValue;

            if (evt.which === 13 && text) {
                this.refs.editInput.getDOMNode().blur();
            }

            else if (evt.which === 27) {
                this.setState({isEditing: false}, function () {
                    this.refs.editInput.getDOMNode().blur();
                });
            }
        },
        handleBlur: function (evt) {
            var text = this.state.editValue;

            if (this.state.isEditing && text) {
                NotesActions.editNote(this.props.note.key, text);
            }

            this.setState({isEditing: false});
        },
        render: function () {
            var iconStyle = {
                marginLeft: '5px'
            };

            var classes = React.addons.classSet({
                'view': !this.state.isEditing,
                'editing': this.state.isEditing
            });

            return (
                <tr className={classes}>
                    <td>{this.props.note.submittedBy}</td>
                    <td>
                        <span className="view">{this.props.note.text}</span>
                        <span className="edit">
                            <input ref="editInput" valueLink={this.linkState('editValue')} type="text" onKeyUp={this.handleValueChange} onBlur={this.handleBlur}/>
                        </span>
                    </td>
                    <td>{this.props.note.submittedDate}</td>
                    <td>
                        <span className="btn btn-primary btn-sm" onClick={this.editItem}>Edit
                            <i className='glyphicon glyphicon-pencil' style={iconStyle}></i>
                        </span>
                    </td>
                </tr>
            );
        }
    });

    var routes = (
        <Route name="app" path="/" handler={App}>
            <Route name="notes" handler={NotePage}/>
            <Route name="users" handler={UserPage}/>
            <DefaultRoute handler={NotePage}/>
        </Route>
    );

    ReactRouter.run(routes, function (Handler) {
        React.render(<Handler/>, document.getElementById('notesApp'));
    });
})(window.React, window.Reflux, window.NotesActions, window.UsersActions, window.AssetsStore, window.UsersStore, window);