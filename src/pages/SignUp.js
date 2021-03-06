/* eslint-disable no-throw-literal */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Header from '../components/HeaderWrapper';
import FormButton from '../components/FormButton';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import _config from '../services/_config';

class SignUp extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirect: false,
			logged: false,
			passwordConfirmed: false,
			loading: false,
		};
	}

	confirmPassword = () => {
		if (this.state.password !== this.state.passwordConfirmation) {
			alert("As senhas não batem!");
			this.setState({ loading: false });
			return false;
		} else {
			this.setState({ passwordConfirmed: true });
			return true;
		}
	}

	register = e => {

		this.setState({ loading: true });
		e.preventDefault();

		let { username, email, name, password, city, uf, job } = this.state;
		let poolData = {}

		if (this.confirmPassword()) {

			poolData = {
				UserPoolId: _config.userPoolId, // Your user pool id here
				ClientId: _config.clientId // Your client id here
			};

			let userPool = new CognitoUserPool(poolData);

			let attributeList = [];

			let dataEmail = {
				Name: 'email',
				Value: email, //get from form field
			};

			let dataUsername = {
				Name: 'nickname',
				Value: username
			};

			let dataAddress = {
				Name: 'address',
				Value: city + ", " + uf
			};

			let dataJob = {
				Name: 'custom:job',
				Value: job
			};

			let dataPersonalName = {
				Name: 'name',
				Value: name
			};

			let dataAdmin = {
				Name: 'custom:admin',
				Value: 'true'
			}

			let attributeEmail = new CognitoUserAttribute(dataEmail);
			let attributePersonalName = new CognitoUserAttribute(dataPersonalName);
			let attributeUsername = new CognitoUserAttribute(dataUsername);
			let attributAddress = new CognitoUserAttribute(dataAddress);
			let attributeJob = new CognitoUserAttribute(dataJob);
			let attributeAdmin = new CognitoUserAttribute(dataAdmin);

			attributeList.push(attributeEmail);
			attributeList.push(attributePersonalName);
			attributeList.push(attributeUsername);
			attributeList.push(attributAddress);
			attributeList.push(attributeJob);
			attributeList.push(attributeAdmin);

			userPool.signUp(email, password, attributeList, null, (err, result) => {

				if (err) {

					if (err.code === "UsernameExistsException") {
						alert("Um usuário com este e-mail já está registrado! Tente outro ou faça login.");
					} else if (err.message === "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6") {
						alert("Sua senha deve ter pelo menos 6 carateres!")
					} else if (err.message === "Password did not conform with policy: Password must have numeric characters") {
						alert("Sua senha deve conter letras e números!")
					} else {
						alert(err.message)
					}

					this.setState({ loading: false });

					return;
				}

				this.setState({ logged: true });
				this.props.history.push({
					pathname: "/login",
					state: { logged: false }
				});

			});
		} else {
			return;
		}

	}

	render() {
		return (
			<React.Fragment>
				<div className="container-fluid mb-1 mt-5 form-wrapper col-lg-12">
					<div className="card col-md-6 mx-auto">
						<div className="card-title mx-auto">
							<h4 className="card-title mt-4">Cadastre-se</h4>
						</div>
						<div className="card-body col-lg-10 mx-auto">
							<form className="pl-0 form-group" onSubmit={this.register}>
								<div className="form-row">
									<div className="form-group col-md-6">
										<label htmlFor="name">Nome completo</label>
										<input type="text" className="form-control" id="name" placeholder="Nome Sobrenome"
											onInput={(e) => this.setState({ name: e.target.value })}></input>
									</div>
									<div className="form-group col-md-6">
										<label htmlFor="username">Nome de usuário</label>
										<input type="text" className="form-control" id="username" placeholder="sobrenome.nome"
											onInput={(e) => this.setState({ username: e.target.value })}></input>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="job">Empresa</label>
									<input type="text" className="form-control" id="job" placeholder="Empresa Ltda."
										onInput={(e) => this.setState({ job: e.target.value })}></input>
								</div>
								<div className="form-group">
									<label htmlFor="inputEmail4">Email</label>
									<input type="email" className="form-control" id="inputEmail4" placeholder="nome@email.com"
										onInput={(e) => this.setState({ email: e.target.value })}></input>
								</div>
								<div className="form-row">
									<div className="form-group col-md-6">
										<label htmlFor="inputPassword4">Senha</label>
										<input type="password" className="form-control" id="inputPassword4" placeholder="senha"
											onInput={(e) => this.setState({ password: e.target.value })}></input>
									</div>
									<div className="form-group col-md-6">
										<label htmlFor="inputPassword5">Confirme sua senha</label>
										<input type="password" className="form-control" id="inputPassword5" placeholder="senha"
											onInput={(e) => this.setState({ passwordConfirmation: e.target.value })}></input>
									</div>
									<small className="form-text text-muted mb-4 ml-1 mt-0 pt-0" >Sua senha deve conter pelo menos 6 dígitos, entre letras e números</small>
								</div>
								<div className="form-row">
									<div className="form-group col-md-10">
										<label htmlFor="inputCity">Cidade</label>
										<input type="text" className="form-control" id="inputCity" placeholder="Cidade"
											onInput={(e) => this.setState({ city: e.target.value })}></input>
									</div>
									<div className="form-group col-md-2">
										<label htmlFor="inputState">Estado</label>
										<input type="text" className="form-control" id="inputState" placeholder="UF"
											onInput={(e) => this.setState({ uf: e.target.value })}></input>
									</div>
								</div>
								<FormButton loading={this.state.loading} label="Cadastrar"/>
								<div className="text-center">
									<Link to="/login"><small className="form-text">Já possuo conta</small></Link>
								</div>
							</form>
						</div>
					</div>
				</div>
				<Header logged={this.state.logged} fixed={false} marginBottom={true} transition={true} ></Header>
			</React.Fragment>
		);
	}
}

export default withRouter(SignUp);