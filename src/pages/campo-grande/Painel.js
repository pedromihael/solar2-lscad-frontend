import React, { Component } from 'react';
import Header from '../../components/HeaderWrapper';
import Footer from '../../components/FooterWrapper';
import Card from '../../components/Card';

import '../styles/Home.css';

export default class Painel extends Component {
  
  render() {
    return (
      <React.Fragment>
        <Header logged={true} fixed={false} marginBottom={true} ufv="campo-grande" />
        <div className="container" id="inner-box">
          <main className="col-lg-12 p-5" role="main" id="main">

            <div className="row p-3">
              <div className="col-lg-4 mb-4" id="painel-cards-wrapper">
                <Card
                  id="ambientais"
                  title="Dados Ambientais"
                  text="Estação solarimétrica em desenvolvimento"
                  link="/campo-grande/ambientais"
                  buttonText="Monitorar agora"
                  buttonActive={false}
                  theme="environmental"
                />
              </div>

              <div className="col-lg-4 mb-4" id="painel-cards-wrapper">
                <Card
                  id="producao"
                  title="Dados de Produção"
                  text="Monitorar dados de produção de Campo Grande"
                  link="/campo-grande/producao"
                  buttonText="Monitorar agora"
                  buttonActive={true}
                  theme="production"
                />
              </div>

              <div className="col-lg-4" id="painel-cards-wrapper">
                <Card
                  id="perdas"
                  title="Perdas"
                  text="Sistema de perdas em desenvolvimento"
                  link="#"
                  buttonText="Monitorar agora"
                  buttonActive={false}
                  theme="loss"
                />
              </div>

            </div>

            <div className="row pb-3 px-3">
              <div className="col-lg-12" id="painel-cards-wrapper">
                <Card
                  id="robo"
                  title="Status do Robô"
                  text="Monitoramento de status do robô em desenvolvimento"
                  link="#"
                  buttonText="Monitorar agora"
                  buttonActive={false}
                  theme="robot"
                />
              </div>
            </div>


          </main>


        </div>
        <Footer />
      </React.Fragment>
    );
  }
}
