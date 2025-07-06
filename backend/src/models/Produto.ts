import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

interface ProdutoAttributes {
  id: number
  erp_id: string
  nome: string
  nome_grupo?: string
  grupo_id?: string
  valor_venda: number
  valor_custo: number
  estoque: number
  codigo_barras?: string
  descricao?: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

interface ProdutoCreationAttributes extends Omit<ProdutoAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Produto extends Model<ProdutoAttributes, ProdutoCreationAttributes> implements ProdutoAttributes {
  public id!: number
  public erp_id!: string
  public nome!: string
  public nome_grupo?: string
  public grupo_id?: string
  public valor_venda!: number
  public valor_custo!: number
  public estoque!: number
  public codigo_barras?: string
  public descricao?: string
  public ativo!: boolean
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Produto.init(
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
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nome_grupo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    grupo_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    valor_venda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    valor_custo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    codigo_barras: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'produtos',
    timestamps: true,
    underscored: true,
  }
)

export default Produto 