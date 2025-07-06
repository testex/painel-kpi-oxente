import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

interface ClienteAttributes {
  id: number
  erp_id: string
  tipo_pessoa: string
  nome: string
  razao_social?: string
  cnpj?: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  cpf?: string
  rg?: string
  data_nascimento?: Date
  telefone: string
  celular: string
  fax?: string
  email: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

interface ClienteCreationAttributes extends Omit<ClienteAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Cliente extends Model<ClienteAttributes, ClienteCreationAttributes> implements ClienteAttributes {
  public id!: number
  public erp_id!: string
  public tipo_pessoa!: string
  public nome!: string
  public razao_social?: string
  public cnpj?: string
  public inscricao_estadual?: string
  public inscricao_municipal?: string
  public cpf?: string
  public rg?: string
  public data_nascimento?: Date
  public telefone!: string
  public celular!: string
  public fax?: string
  public email!: string
  public ativo!: boolean
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Cliente.init(
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
    tipo_pessoa: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razao_social: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cnpj: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    inscricao_estadual: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    inscricao_municipal: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    rg: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    data_nascimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fax: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'clientes',
    timestamps: true,
    underscored: true,
  }
)

export default Cliente 