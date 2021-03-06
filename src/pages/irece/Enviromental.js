/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import React, { Component } from 'react';

import LineChart from '../../components/LineChart';
import BarChart from '../../components/BarChart';
import TitleBar from '../../components/TitleBar';
import Navigator from '../../components/Navigator';
import Header from '../../components/HeaderWrapper';
import Footer from '../../components/FooterWrapper';
import Table from '../../components/Table';

import api from '../../services/api';
import sadsun from '../imgs/sadsun.png'

import dateFormater from '../../utils/dateFormater';
import howManyDaysThisMonth from '../../utils/daysInMonthDefiner';

export default class Enviromental extends Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			monthDay: 'carregando...',
			period: 'day',
			dayActive: true,
			labels: [],
			data: [],
			isLoading: true,
			rightNavigationDisabled: true,
			leftNavigationDisabled: false
		};

	}

	_isMounted = false;
	_isUpdated = true;
	now = new Date();
	actualDay = this.now.getDate();
	actualMonth = this.now.getMonth() + 1;
	actualYear = this.now.getFullYear();
	currentDay = this.now.getDate();
	currentMonth = this.now.getMonth() + 1;
	currentYear = this.now.getFullYear();

	componentDidMount() {
		let date = dateFormater(this.actualDay, this.actualMonth, this.actualYear);
		this._isMounted = true;
		this.fetchApiResponse(date, this.state.period);
	}

	fetchApiResponse = async (date, period) => {

		let apiResponse = await api.get('/irece/ambientais/' + date + '/' + period);

		this.refreshState(apiResponse.data, period)
			.then(async (newStateObject) => {

				if (this._isMounted || !this._isUpdated) {
					this.setState({
						day: newStateObject.day,
						month: newStateObject.month,
						year: newStateObject.year,
						monthDay: newStateObject.monthDay,
						period: newStateObject.period,
						labels: newStateObject.interval,
						data: newStateObject.data,
						dataForTable: newStateObject.dataForTable || [0],
						options: newStateObject.options,
						isLoading: (!newStateObject.interval.length)
					});

				}
			})

	}

	refreshState = async (res, period) => {

		return new Promise((resolve, reject) => {
			if (period === "day") {
				let differentDay = (this.currentDay != res.day || this.currentMonth != res.month || this.currentYear != res.year);

				let head = [
					(differentDay) ? 'Temperatura média' : 'Temperatura atual',
					(differentDay) ? 'Umidade média relativa do ar' : 'Umidade relativa do ar',
					'Precipitação acumulada',
					(differentDay) ? 'Velocidade do vento média' : 'Velocidade do vento atual',
					(differentDay) ? 'Pressão atmosférica média' : 'Pressão atmosférica atual'
				]

				let temperatureSum = res.temperature.reduce((acc, cur) => acc + cur);
				let temperatureAverage = temperatureSum / res.temperature.length;
				let humiditySum = res.humidity.reduce((acc, cur) => acc + cur);
				let humidityAverage = humiditySum / res.humidity.length;
				let windSpeedSum = res.windSpeed.reduce((acc, cur) => acc + cur);
				let windSpeedAverage = windSpeedSum / res.windSpeed.length;
				let atmPressureSum = res.atmPressure.reduce((acc, cur) => acc + cur);
				let atmPressureAverage = atmPressureSum / res.atmPressure.length;

				let windSpeed = res.windSpeed.pop() || 0
				let atmPressure = res.atmPressure.pop() || 0
				let temperature = res.temperature.pop() || 0
				let humidity = res.humidity.pop() || 0

				let body = [[
					(differentDay) ? parseFloat(temperatureAverage).toFixed(1) + " °C" : parseFloat(temperature).toFixed(1) + " °C",
					(differentDay) ? parseFloat(humidityAverage).toFixed(1) + " %" : parseFloat(humidity).toFixed(1) + " %",
					0 + " mm/m³",
					(differentDay) ? parseFloat(windSpeedAverage).toFixed(1) + " km/h" : parseFloat(windSpeed).toFixed(1) + " km/h",
					(differentDay) ? parseInt(atmPressureAverage) + " atm" : parseInt(atmPressure) + " atm"
				]]

				let dataForTable = {
					head,
					body
				}

				resolve({
					day: res.day,
					month: res.month,
					year: res.year,
					monthDay: res.monthDay,
					period: res.period,
					interval: res.interval,
					dataForTable,
					data: {
						table1: {
							data: res.solarRadiation,
							lineTension: 0,
							label: 'Irradiação inclinada sobre a mesa (W/m²)',
							backgroundColor: 'rgba(66,161,245,0)',
							borderColor: 'rgba(66,161,245,1.0)',
							pointBackgroundColor: 'rgba(66,161,245,1.0)',
						},
						table2: {
							data: res.averageRadiation,
							lineTension: 0,
							label: 'Irradiação inclinada referencial (W/m²)',
							backgroundColor: 'rgba(255,48,48, 0)',
							borderColor: 'rgba(255,48,48, 1.0)',
							pointBackgroundColor: 'rgba(255,48,48, 0.7)',
						},
					},
					options: {
						animation: {
							duration: 1000,
						},
						title: {
							display: true,
							fontsize: 24,
							text: "Irradiação solar",
						},
						labels: {
							fontStyle: 'bold',
						},
						scales: {
							yAxes: [{
								beginAtZero: true,
								position: "left",
								id: "performance"
							},

							],
							xAxes: [{
								beginAtZero: true,
								ticks: {
									callback: function (dataLabel, index) {
										return index % 2 === 0 ? dataLabel : '';
									},
									maxRotation: 0,
								}
							}]
						},
					}

				})
			}
			else if (period === "month") {

				let items = {
					day: this.actualDay,
					month: res.month,
					year: res.year,
					monthDay: res.monthDay,
					period: res.period,
					interval: res.monthInterval,
					data: {
						averageIrradiations: {
							data: res.averageIrradiations,
							lineTension: 0,
							label: 'Média diária (W/m²)',
							backgroundColor: 'rgba(66,161,245,1.0)',
							borderColor: 'rgba(66,161,245,1.0)',
							pointBackgroundColor: 'rgba(66,161,245,1.0)',
							pointHoverRadius: 7
						},
						higherIrradiations: {
							type: 'line',
							data: res.higherIrradiations,
							lineTension: 0,
							label: 'Pico diário (W/m³)',
							borderWidth: 3,
							backgroundColor: 'rgba(255,48,48, 0)',
							borderColor: 'rgba(255,48,48, 1.0)',
							pointBackgroundColor: 'rgba(255,48,48, 0.7)',
							pointHoverRadius: 7
						},
						averageTemperatures: {
							data: res.averageTemperatures,
							lineTension: 0,
							label: 'Média diária (°C)',
							backgroundColor: 'rgba(66, 134, 244, 1.0)',
							borderColor: 'rgba(66, 134, 244, 1.0)',
							pointBackgroundColor: 'rgba(66, 134, 244, 0.7)',
							pointHoverRadius: 7
						},
						higherTemperatures: {
							type: 'line',
							data: res.higherTemperatures,
							lineTension: 0,
							label: 'Maior temperatura diária (°C)',
							borderWidth: 3,
							backgroundColor: 'rgba(255,48,48, 0)',
							borderColor: 'rgba(255,48,48, 1.0)',
							pointBackgroundColor: 'rgba(255,48,48, 0.7)',
							pointHoverRadius: 7,
							yAxisID: "right"
						},
						lowerTemperatures: {
							type: 'line',
							data: res.lowerTemperatures,
							lineTension: 0,
							label: 'Menor temperatura diária (°C)',
							borderWidth: 3,
							backgroundColor: 'rgba(255,166,0,0)',
							borderColor: 'rgba(255,166,0,1.0)',
							pointBackgroundColor: 'rgba(255,166,0, 0.7)',
							pointHoverRadius: 7,
							yAxisID: "right"
						},
						accumulateRainfall: {
							data: res.accumulateRainfall,
							lineTension: 0,
							label: 'Umidade acumulada (mm/M³)',
							backgroundColor: 'rgba(50,172,92, 1.0)',
							borderColor: 'rgba(50,172,92, 1.0)',
							pointBackgroundColor: 'rgba(50,172,92, 0.7)',
							pointHoverRadius: 7
						},
						averageWindSpeeds: {
							data: res.averageWindSpeeds,
							lineTension: 0,
							borderWidth: 3,
							label: 'Média diária (km/h)',
							backgroundColor: 'rgba(255,166,0, 0)',
							borderColor: 'rgba(255,166,0,1.0)',
							pointBackgroundColor: 'rgba(255,166,0, 0.7)',
							pointHoverRadius: 7
						}
					},
					options: {
						irradiationOptions: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Irradiação",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},

								],
								xAxes: [{
									beginAtZero: true,
									ticks: {
										callback: function (dataLabel, index) {
											return index % 4 === 0 ? dataLabel : '';
										},
										maxRotation: 0,
									}
								}]
							},
						},
						temperatureOptions: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Temperatura",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},

								],
								xAxes: [{
									beginAtZero: true,
									ticks: {
										callback: function (dataLabel, index) {
											return index % 4 === 0 ? dataLabel : '';
										},
										maxRotation: 0,
									}
								}]
							},
						},
						humidityOptions: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Umidade do ar",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
								}],
								xAxes: [{
									beginAtZero: true,
									ticks: {
										callback: function (dataLabel, index) {
											return index % 4 === 0 ? dataLabel : '';
										},
										maxRotation: 0,
									}
								}]
							},
						},
						windSpeedOptions: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Velocidade do vento",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true
								}],
								xAxes: [{
									beginAtZero: true,
									ticks: {
										callback: function (dataLabel, index) {
											return index % 4 === 0 ? dataLabel : '';
										},
										maxRotation: 0,
									}
								}]
							},
						},
					}

				}

				resolve(items)

			} else if (period === "year") {

				const {
					irradiations,
					temperatures,
					windSpeeds,
					rainfalls,
					yearInterval,
					year,
					period
				} = res;

				let higherIrradiations = [];
				let averageIrradiations = [];

				let lowerTemperature = [];
				let higherTemperature = [];
				let averageTemperature = [];

				let averageWindSpeed = [];
				let higherWindSpeed = [];

				let accumulateRainfall = [];
				let higherAccumulateRainfall = [];

				irradiations.map(item => {
					// higherIrradiations.push(item.higherIrradiationDay + ": " + item.higherIrradiation);
					higherIrradiations.push(item.higherIrradiation);
					averageIrradiations.push(item.averageIrradiation);
				});

				temperatures.map(item => {
					// lowerTemperature.push(item.lowerTemperatureDay + ": " + item.lowerTemperature);
					lowerTemperature.push(item.lowerTemperature);
					// higherTemperature.push(item.higherTemperatureDay + ": " + item.higherTemperature);
					higherTemperature.push(item.higherTemperature);
					averageTemperature.push(item.averageTemperature);
				});

				windSpeeds.map(item => {
					let day = ((item.higherWindSpeedDay === 'null') ? 0 : item.higherWindSpeedDay);
					averageWindSpeed.push(item.averageWindSpeed);
					higherWindSpeed.push(day + ": " + item.higherWindSpeed);
				});

				rainfalls.map(item => {
					higherAccumulateRainfall.push(item.higherAccumulateRainfall);
					accumulateRainfall.push(item.accumulateRainfall);
				});

				let items = {
					day: this.actualDay,
					month: this.actualMonth,
					year: year,
					monthDay: year,
					period: period,
					interval: yearInterval,
					data: {
						irradiations: {
							averageIrradiations: {
								data: averageIrradiations,
								lineTension: 0,
								label: 'Média (W/m²)',
								backgroundColor: 'rgba(66,161,245,1.0)',
								borderColor: 'rgba(66,161,245,1.0)',
								pointBackgroundColor: 'rgba(66,161,245,1.0)',
								pointHoverRadius: 7
							},
							higherIrradiations: {
								type: 'line',
								data: higherIrradiations,
								lineTension: 0,
								label: 'Pico mensal - Dia (W/m³)',
								borderWidth: 3,
								backgroundColor: 'rgba(255,48,48, 0)',
								borderColor: 'rgba(255,48,48, 1.0)',
								pointBackgroundColor: 'rgba(255,48,48, 0.7)',
								pointHoverRadius: 7,
								yAxisID: "right"
							},
						},
						temperatures: {
							averageTemperature: {
								data: averageTemperature,
								lineTension: 0,
								label: 'Média (°C)',
								backgroundColor: 'rgba(66,161,245,1.0)',
								borderColor: 'rgba(66,161,245,1.0)',
								pointBackgroundColor: 'rgba(66,161,245,1.0)',
								pointHoverRadius: 7
							},
							lowerTemperature: {
								type: 'line',
								data: lowerTemperature,
								lineTension: 0,
								label: 'Menor temperatura (°C)',
								borderWidth: 3,
								backgroundColor: 'rgba(255,166,0,0)',
								borderColor: 'rgba(255,166,0,1.0)',
								pointBackgroundColor: 'rgba(255,166,0, 0.7)',
								pointHoverRadius: 7,
								yAxisID: "right"
							},
							higherTemperature: {
								type: 'line',
								data: higherTemperature,
								lineTension: 0,
								label: 'Maior temperatura (°C)',
								borderWidth: 3,
								backgroundColor: 'rgba(255,48,48, 0)',
								borderColor: 'rgba(255,48,48, 1.0)',
								pointBackgroundColor: 'rgba(255,48,48, 0.7)',
								pointHoverRadius: 7,
								yAxisID: "right"
							}
						},
						windSpeeds: {
							averageWindSpeed: {
								data: averageWindSpeed,
								lineTension: 0,
								borderWidth: 3,
								label: 'Média (km/h)',
								backgroundColor: 'rgba(66,161,245,1.0)',
								borderColor: 'rgba(66,161,245,1.0)',
								pointBackgroundColor: 'rgba(66,161,245,1.0)',
								pointHoverRadius: 7
							},
							higherWindSpeed: {
								type: 'line',
								data: higherWindSpeed,
								lineTension: 0,
								label: 'Maior velocidade (km/h)',
								borderWidth: 3,
								backgroundColor: 'rgba(255,48,48, 0)',
								borderColor: 'rgba(255,48,48, 1.0)',
								pointBackgroundColor: 'rgba(255,48,48, 0.7)',
								pointHoverRadius: 7,
								yAxisID: "right"
							}
						},
						rainfalls: {
							higherAccumulateRainfall: {
								type: 'line',
								data: higherAccumulateRainfall,
								lineTension: 0,
								label: 'Pico mensal (mm/m³ - Dia)',
								borderWidth: 3,
								backgroundColor: 'rgba(255,48,48, 0)',
								borderColor: 'rgba(255,48,48, 1.0)',
								pointBackgroundColor: 'rgba(255,48,48, 0.7)',
								pointHoverRadius: 7,
								yAxisID: "right"
							},
							accumulateRainfall: {
								data: accumulateRainfall,
								lineTension: 0,
								borderWidth: 3,
								label: 'Total (mm/m³)',
								backgroundColor: 'rgba(66,161,245,1.0)',
								borderColor: 'rgba(66,161,245,1.0)',
								pointBackgroundColor: 'rgba(66,161,245,1.0)',
								pointHoverRadius: 7,
								yAxisID: "left"
							}
						},
					},
					options: {
						irradiation: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Irradiação",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},

								],
								xAxes: [{
									beginAtZero: true,
								}]
							},
						},
						temperature: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Temperatura",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},

								],
								xAxes: [{
									beginAtZero: true,
								}]
							},
						},
						rainfall: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Precipitação",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},
								],
								xAxes: [{
									beginAtZero: true,
								}]
							},
						},
						windSpeed: {
							animation: {
								duration: 1000,
							},
							title: {
								display: true,
								fontsize: 24,
								text: "Velocidade do vento",
							},
							labels: {
								fontStyle: 'bold',
							},
							scales: {
								yAxes: [{
									beginAtZero: true,
									position: "left",
									id: "left"
								},
								{
									beginAtZero: true,
									position: "right",
									id: "right"
								},
								],
								xAxes: [{
									beginAtZero: true,
								}]
							},
						}
					}

				}

				resolve(items)

			}

			else reject("Period not found")

		})

	}

	decrementDate = () => {

		let day = this.state.day;
		let month = this.state.month;
		let year = this.state.year;

		if (this.state.period == "day") {
			if ((year == 2018 && month >= 9 && day >= 1) || year > 2018) {

				if (day > 1) {
					day--;
				} else if (day == 1 && month != 1) {
					day = howManyDaysThisMonth(month - 1);
					month--;
				} else {
					day = 31;
					month = 12;
					year--;
				}

				if (year == 2018 && month == 9 && day == 1) {
					this.setState({ leftNavigationDisabled: true });
				}

				this.setState({
					day,
					month,
					year,
					rightNavigationDisabled: false
				});

			}
		} else if (this.state.period == "month") {
			if ((year == 2018 && month >= 9) || year > 2018) {

				if (month > 1) {
					month--;
				} else {
					month = 12;
					year--;
				}

				this.setState({
					month,
					year,
					rightNavigationDisabled: false
				});

				if (year == 2018 && month == 9) {
					this.setState({ leftNavigationDisabled: true });
				}

			}
		} else if (this.state.period == "year") {
			if (year > 2018) {
				year--;
				this.setState({
					year,
					rightNavigationDisabled: false
				});

				if (year == 2018) {
					this.setState({ leftNavigationDisabled: true })
				}

			}
		}

		this._isUpdated = false;

	}

	incrementDate = () => {

		let day = this.state.day;
		let month = this.state.month;
		let year = this.state.year;

		if (this.state.period == "day") {
			if (year < this.actualYear ||
				(year == this.actualYear && month < this.actualMonth) ||
				(year == this.actualYear && month == this.actualMonth && day < this.actualDay)) {

				if (day == 31 && month == 12) {
					day = 1;
					month = 1;
					year++;
				} else if (day == howManyDaysThisMonth(month)) {
					day = 1;
					month++;
				} else {
					day++;
				}

				this.setState({
					day,
					month,
					year,
					leftNavigationDisabled: false
				});

				if (year == this.actualYear && month == this.actualMonth && day == this.actualDay) {
					this.setState({ rightNavigationDisabled: true })
				}

			}
		} else if (this.state.period == "month") {
			if (year < this.actualYear ||
				(year == this.actualYear && month < this.actualMonth)) {

				if (month == 12) {
					month = 1;
					year++;
				} else {
					month++;
				}

				this.setState({
					month,
					year,
					leftNavigationDisabled: false
				});

				if (month == this.actualMonth && year == this.actualYear) {
					this.setState({ rightNavigationDisabled: true })
				}

			}
		} else if (this.state.period == "year") {
			if (year < this.actualYear) {
				year++;
				this.setState({
					year,
					leftNavigationDisabled: false
				});
				if (year == this.actualYear) {
					this.setState({ rightNavigationDisabled: true })
				}
			}
		}

		this._isUpdated = false;

	}

	handleDayRendering = () => {

		let date = dateFormater(this.actualDay, this.actualMonth, this.actualYear);
		this._isMounted = true;
		this.fetchApiResponse(date, 'day');
		this.setState({
			dayActive: true,
			monthActive: false,
			yearActive: false,
			leftNavigationDisabled: false,
			rightNavigationDisabled: true
		});

	}

	handleMonthRendering = () => {

		let date = dateFormater(this.actualDay, this.actualMonth, this.actualYear);
		this._isMounted = true;
		this.fetchApiResponse(date, 'month');
		this.setState({
			dayActive: false,
			monthActive: true,
			yearActive: false,
			leftNavigationDisabled: false,
			rightNavigationDisabled: true
		});

	}

	handleYearRendering = () => {

		let date = dateFormater(this.actualDay, this.actualMonth, this.actualYear);
		this._isMounted = true;
		this.fetchApiResponse(date, 'year');
		this.setState({
			dayActive: false,
			monthActive: false,
			yearActive: true,
			leftNavigationDisabled: false,
			rightNavigationDisabled: true
		});

	}

	UNSAFE_componentWillUpdate(newProps, newState) {

		if (!this._isUpdated) {
			let date = dateFormater(newState.day, newState.month, newState.year);
			this.fetchApiResponse(date, this.state.period);
		}

	}

	componentDidUpdate() {
		this._isUpdated = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {

		if (this.state.period === "day" && !this.state.isLoading) {
			return (
				<React.Fragment>
					<Header logged={true} fixed={false} marginBottom={true} ufv="irece" />
					<div className="row">
						<div className="col-11 mx-auto">
							<main className="col-lg-12 mx-auto p-0" role="main" id="main">

								<TitleBar text="Ambientais - Irecê" theme="environmental" />
								<Navigator
									date={this.state.monthDay}
									handlePrevDateNavigation={this.decrementDate}
									handleNextDateNavigation={this.incrementDate}
									yearActive={this.state.yearActive}
									monthActive={this.state.monthActive}
									dayActive={this.state.dayActive}
									month="allowed"
									year="allowed"
									handleYearRendering={this.handleYearRendering}
									handleMonthRendering={this.handleMonthRendering}
									handleDayRendering={this.handleDayRendering}
									leftNavigationDisabled={this.state.leftNavigationDisabled}
									rightNavigationDisabled={this.state.rightNavigationDisabled}
								/>

								<div className="row m-4 px-0 py-0" id="row-chart">
									<div className="col-md-10 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-1">
										<LineChart
											data={{ labels: this.state.labels, datasets: [this.state.data.table1, this.state.data.table2] }}
											options={this.state.options}
										/>
									</div>
								</div>

								<Table head={this.state.dataForTable.head} body={this.state.dataForTable.body} />

							</main>
						</div>
					</div>
					<Footer />
				</React.Fragment>
			);
		}

		else if (this.state.period === "month" && !this.state.isLoading && this.state.labels != undefined) {
			return (
				<React.Fragment>
					<Header logged={true} fixed={false} marginBottom={true} />
					<div className="row">
						<div className="col-11 mx-auto">
							<main className="col-lg-12 mx-auto p-0" role="main" id="main">
								<TitleBar text="Ambientais - Irecê" theme="environmental" />
								<Navigator
									date={this.state.monthDay}
									handlePrevDateNavigation={this.decrementDate}
									handleNextDateNavigation={this.incrementDate}
									yearActive={this.state.yearActive}
									monthActive={this.state.monthActive}
									dayActive={this.state.dayActive}
									month="allowed"
									year="allowed"
									handleYearRendering={this.handleYearRendering}
									handleMonthRendering={this.handleMonthRendering}
									handleDayRendering={this.handleDayRendering}
									leftNavigationDisabled={this.state.leftNavigationDisabled}
									rightNavigationDisabled={this.state.rightNavigationDisabled}
								/>
								<div className="row m-4 px-0 py-0" id="row-chart">
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-1">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.averageIrradiations, this.state.data.higherIrradiations] }}
											options={this.state.options.irradiationOptions}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-2">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.higherTemperatures, this.state.data.lowerTemperatures, this.state.data.averageTemperatures] }}
											options={this.state.options.temperatureOptions}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-3">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.accumulateRainfall] }}
											options={this.state.options.humidityOptions}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-4">
										<LineChart
											data={{ labels: this.state.labels, datasets: [this.state.data.averageWindSpeeds] }}
											options={this.state.options.windSpeedOptions}
										/>
									</div>
								</div>

							</main>
						</div>
					</div>
					<Footer />
				</React.Fragment>
			);
		}

		else if (this.state.period === "year" && !this.state.isLoading && this.state.labels != undefined) {
			return (
				<React.Fragment>
					<Header logged={true} fixed={false} marginBottom={true} />
					<div className="row">
						<div className="col-11 mx-auto">
							<main className="col-lg-12 mx-auto p-0" role="main" id="main">
								<TitleBar text="Ambientais - Irecê" theme="environmental" />
								<Navigator
									date={this.state.monthDay}
									handlePrevDateNavigation={this.decrementDate}
									handleNextDateNavigation={this.incrementDate}
									yearActive={this.state.yearActive}
									monthActive={this.state.monthActive}
									dayActive={this.state.dayActive}
									month="allowed"
									year="allowed"
									handleYearRendering={this.handleYearRendering}
									handleMonthRendering={this.handleMonthRendering}
									handleDayRendering={this.handleDayRendering}
									leftNavigationDisabled={this.state.leftNavigationDisabled}
									rightNavigationDisabled={this.state.rightNavigationDisabled}
								/>
								<div className="row m-4 px-0 py-0" id="row-chart">
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-1">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.irradiations.higherIrradiations, this.state.data.irradiations.averageIrradiations] }}
											options={this.state.options.irradiation}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-2">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.temperatures.higherTemperature, this.state.data.temperatures.lowerTemperature, this.state.data.temperatures.averageTemperature] }}
											options={this.state.options.temperature}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-4">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.windSpeeds.higherWindSpeed, this.state.data.windSpeeds.averageWindSpeed] }}
											options={this.state.options.windSpeed}
										/>
									</div>
									<div className="col-md-6 container-fluid pb-3 pt-0 py-0 mx-auto my-auto" id="canvas-container-5">
										<BarChart
											data={{ labels: this.state.labels, datasets: [this.state.data.rainfalls.higherAccumulateRainfall, this.state.data.rainfalls.accumulateRainfall] }}
											options={this.state.options.rainfall}
										/>
									</div>
								</div>

							</main>
						</div>
					</div>
					<Footer />
				</React.Fragment>
			);
		}

		else {
			return (
				<React.Fragment>
					<Header logged={true} fixed={false} marginBottom={true} />
					<div className="row">
						<div className="col-11 mx-auto">
							<main className="col-lg-12 mx-auto p-0" role="main" id="main">

								<TitleBar text="Produção - Irecê" theme="production" />
								<Navigator
									date={this.state.monthDay}
									handlePrevDateNavigation={this.decrementDate}
									handleNextDateNavigation={this.incrementDate}
									yearActive={this.state.yearActive}
									monthActive={this.state.monthActive}
									dayActive={this.state.dayActive}
									year="allowed"
									month="allowed"
									handleYearRendering={this.handleYearRendering}
									handleMonthRendering={this.handleMonthRendering}
									handleDayRendering={this.handleDayRendering}
									leftNavigationDisabled={this.state.leftNavigationDisabled}
									rightNavigationDisabled={this.state.rightNavigationDisabled}
								/>

								<div className="row m-4 px-0 py-0" id="sun-img">
									<img src={sadsun} className="bd-placeholder-img mx-auto mb-2 mt-3" alt="Sol escondido atrás de nuvem" width="265" height="240" focusable="false" aria-label="Placeholder: 140x140"></img>

								</div>
								<div className="row mx-auto text-muted" id="text-sun-1">
									<h3 className="mx-auto">Opa! Parece que não existem dados para esta data.</h3>
								</div>
								<div className="row mx-auto mb-5 text-muted" id="text-sun-2">
									<h5 className="mx-auto mb-5">Navegue para outras datas para visualiar mais gráficos.</h5>
								</div>

							</main>
						</div>
					</div>
					<Footer />
				</React.Fragment>
			);
		}

	}
}
