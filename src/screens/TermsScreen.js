import React from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';

export function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Política de Privacidade</Text>
        <Text style={styles.subTitle}>AstralMatch</Text>
        <Text style={styles.date}>Última atualização: 05/03/2025</Text>

        <Text style={styles.sectionTitle}>1. Introdução</Text>
        <Text style={styles.paragraph}>
          Bem-vindo(a) ao AstralMatch. Nossa Política de Privacidade descreve como
          coletamos, utilizamos, compartilhamos e protegemos suas informações quando
          você usa nosso aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>2. Coleta de Informações</Text>
        <Text style={styles.paragraph}>
          Podemos coletar dados pessoais (como nome, e-mail) e informações de uso
          (como preferências de busca ou histórico de interações). Utilizamos esses
          dados para melhorar sua experiência, oferecer sugestões personalizadas e
          garantir a segurança da plataforma.
        </Text>

        <Text style={styles.sectionTitle}>3. Uso de Dados</Text>
        <Text style={styles.paragraph}>
          Ajustamos recomendações de perfis e conteúdos com base em seus interesses
          e comportamento no aplicativo. Podemos utilizar serviços de terceiros para
          análises, publicidade ou pagamento, cada um com suas próprias políticas de
          privacidade.
        </Text>

        <Text style={styles.sectionTitle}>4. Compartilhamento de Informações</Text>
        <Text style={styles.paragraph}>
          Compartilhamos dados somente com parceiros confiáveis que nos auxiliam na
          operação do AstralMatch. Podemos também divulgar informações para cumprir
          obrigações legais ou proteger os direitos da plataforma e de nossos
          usuários.
        </Text>

        <Text style={styles.sectionTitle}>5. Segurança</Text>
        <Text style={styles.paragraph}>
          Tomamos medidas para proteger suas informações contra acesso não
          autorizado. Entretanto, nenhum método de transmissão ou armazenamento de
          dados é totalmente seguro.
        </Text>

        <Text style={styles.sectionTitle}>6. Alterações na Política</Text>
        <Text style={styles.paragraph}>
          Podemos alterar esta política periodicamente. Notificaremos você sobre
          mudanças importantes por meio de aviso no aplicativo ou por e-mail.
        </Text>

     

        <View style={styles.buttonContainer}>
          <Button 
            title="Ver Termos de Uso"
            onPress={() => navigation.navigate('TermsOfUseScreen')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export function TermsOfUseScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Termos de Uso</Text>
        <Text style={styles.subTitle}>AstralMatch</Text>
        <Text style={styles.date}>Última atualização: 05/03/2025</Text>

        <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
        <Text style={styles.paragraph}>
          Ao usar o AstralMatch, você concorda em cumprir estes Termos de Uso. Caso
          não concorde, interrompa o uso do aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>2. Elegibilidade</Text>
        <Text style={styles.paragraph}>
          Você deve ter pelo menos 18 anos para usar o AstralMatch. Ao criar uma conta,
          declara ter a idade mínima exigida pela legislação do seu país.
        </Text>

        <Text style={styles.sectionTitle}>3. Uso do Aplicativo</Text>
        <Text style={styles.paragraph}>
          É necessário criar e manter uma conta válida, fornecendo informações
          verdadeiras. Não é permitido publicar conteúdo ilegal, ofensivo ou que viole
          direitos de terceiros.
        </Text>

        <Text style={styles.sectionTitle}>4. Direitos de Propriedade Intelectual</Text>
        <Text style={styles.paragraph}>
          O conteúdo do AstralMatch (marca, logotipo e layout) é de propriedade
          exclusiva do AstralMatch. O conteúdo postado pelos usuários permanece sob a
          titularidade de cada um, mas o usuário concede ao AstralMatch uma licença de
          uso conforme necessário para o funcionamento do aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitação de Responsabilidade</Text>
        <Text style={styles.paragraph}>
          O AstralMatch é fornecido "como está". Não oferecemos garantias quanto a
          resultados, compatibilidades ou disponibilidade contínua. Não nos
          responsabilizamos por conduta de terceiros, incluindo outros usuários.
        </Text>

        <Text style={styles.sectionTitle}>6. Rescisão</Text>
        <Text style={styles.paragraph}>
          Podemos encerrar ou suspender sua conta a qualquer momento em caso de
          violação destes termos ou qualquer comportamento que prejudique a plataforma
          ou outros usuários.
        </Text>

        <Text style={styles.sectionTitle}>7. Alterações nos Termos</Text>
        <Text style={styles.paragraph}>
          Reservamo-nos o direito de alterar estes termos a qualquer momento.
          Notificaremos alterações significativas por meio de aviso no aplicativo ou
          por e-mail.
        </Text>

      

        <View style={styles.buttonContainer}>
          <Button
            title="Ver Política de Privacidade"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos de exemplo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'justify',
  },
  buttonContainer: {
    marginVertical: 8,
  },
});
