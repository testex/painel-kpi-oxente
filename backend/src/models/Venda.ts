import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

interface VendaAttributes {
  id: number
  erp_id: string
  codigo: string
  cliente_id: string
  nome_cliente: string
  vendedor_id?: string
  nome_vendedor?: string
  data: Date
  situacao_id: string
  nome_situacao: string
  valor_total: number
  valor_custo: number
  valor_frete: number
  nome_canal_venda: string
  nome_loja: string
  condicao_pagamento: string
  situacao_financeiro: string
  situacao_estoque: string
  observacoes?: string
  observacoes_interna?: string
  created_at: Date
  updated_at: Date
}

interface VendaCreationAttributes extends Omit<VendaAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Venda extends Model<VendaAttributes, VendaCreationAttributes> implements VendaAttributes {
  public id!: number
  public erp_id!: string
  public codigo!: string
  public cliente_id!: string
  public nome_cliente!: string
  public vendedor_id?: string
  public nome_vendedor?: string
  public data!: Date
  public situacao_id!: string
  public nome_situacao!: string
  public valor_total!: number
  public valor_custo!: number
  public valor_frete!: number
  public nome_canal_venda!: string
  public nome_loja!: string
  public condicao_pagamento!: string
  public situacao_financeiro!: string
  public situacao_estoque!: string
  public observacoes?: string
  public observacoes_interna?: string
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Venda.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    erp_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cliente_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nome_cliente: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vendedor_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nome_vendedor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    situacao_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nome_situacao: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    valor_custo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    valor_frete: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    nome_canal_venda: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nome_loja: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    condicao_pagamento: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    situacao_financeiro: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    situacao_estoque: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observacoes_interna: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'vendas',
    timestamps: true,
    underscored: true,
  }
)

export default Venda 