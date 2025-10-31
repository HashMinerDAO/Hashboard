# Zettahash DAO Client Rules

## Project Overview
Hashboard is the official dashboard application for the Zettahash DAO ecosystem, providing complete transparency into mining operations, financial data, governance processes, and community engagement.

## Core Requirements

### Transparency Standards
- **Complete Data Access**: All operational data must be accessible to token holders
- **Real-time Updates**: Critical metrics should update within 15-30 second intervals
- **Audit Trail**: All data sources and calculations must be traceable and verifiable
- **Public Verification**: Enable community verification of reported data

### DAO Governance Integration
- **Snapshot Integration**: Full integration with Snapshot.org for proposal voting
- **Voting Transparency**: Clear display of voting power, quorum requirements, and results
- **Proposal Tracking**: Complete lifecycle tracking from creation to execution
- **Delegation Support**: Enable voting delegation for inactive token holders

### Mining Operations Transparency
- **Hashrate Monitoring**: Real-time display of network hashrate and individual contributions
- **Revenue Tracking**: Transparent display of mining rewards and distribution
- **Pool Performance**: Clear metrics on pool efficiency and payout accuracy
- **Network Health**: Comprehensive network status indicators

### Financial Transparency
- **Treasury Tracking**: Real-time wallet balances across all managed addresses
- **Token Metrics**: Complete ZH token analytics and market data
- **Vesting Schedules**: Transparent display of token vesting and lockup periods
- **Revenue Distribution**: Clear breakdown of revenue sources and allocation

## Technical Standards

### Web3 Integration Requirements
- **Multi-wallet Support**: Support for MetaMask, WalletConnect, Coinbase Wallet, and other major providers
- **Network Switching**: Seamless switching between Ethereum mainnet and testnets
- **ENS Resolution**: Full support for Ethereum Name Service resolution
- **Gas Optimization**: Implement gas estimation and optimization features

### Security Requirements
- **Input Sanitization**: All user inputs must be validated and sanitized
- **XSS Prevention**: Implement Content Security Policy and input sanitization
- **API Security**: Never expose private keys or sensitive credentials
- **Audit Preparation**: Code must be auditable and follow Web3 security best practices

### Performance Requirements
- **Load Time**: Initial page load under 3 seconds
- **Real-time Updates**: Sub-second response times for critical data
- **Scalability**: Support for 1000+ concurrent users
- **Caching Strategy**: Intelligent caching to reduce API load

## Community Features

### Communication Channels
- **Forum Integration**: Reddit-style discussion platform for community engagement
- **Multi-platform Links**: Direct links to Discord, Telegram, and other community channels
- **Announcement System**: Official DAO announcements and updates
- **Support Integration**: Integrated support ticket system

### User Experience
- **Responsive Design**: Full mobile and tablet support
- **Accessibility**: WCAG 2.1 AA compliance for all interfaces
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Offline Capability**: Basic functionality available offline

## Development Workflow

### Contribution Process
- **Fork and Branch**: All changes start with forked repository and feature branches
- **Code Review**: Mandatory peer review for all changes
- **Testing Requirements**: Comprehensive test coverage for critical features
- **Documentation**: All changes must include updated documentation

### Deployment Standards
- **Staging Environment**: All changes tested in staging before production
- **Rollback Capability**: Automatic rollback procedures for critical issues
- **Monitoring**: Comprehensive monitoring and alerting for production systems
- **Backup Strategy**: Regular backups of all critical data and configurations

## Compliance and Legal

### Regulatory Compliance
- **Data Privacy**: GDPR and privacy regulation compliance
- **Financial Reporting**: Accurate and transparent financial data presentation
- **AML/KYC**: Integration with anti-money laundering procedures where required
- **Jurisdictional Compliance**: Adherence to relevant regulatory frameworks

### Intellectual Property
- **Open Source**: Appropriate open source licensing for community contributions
- **DAO Ownership**: Clear ownership and licensing for DAO-developed components
- **Third-party Licenses**: Proper attribution and licensing for all dependencies
- **Branding Guidelines**: Consistent use of Zettahash branding and trademarks
