export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      BHClan: {
        Row: {
          created: number | null;
          id: string;
          name: string;
          xp: number;
        };
        Insert: {
          created?: number | null;
          id: string;
          name: string;
          xp: number;
        };
        Update: {
          created?: number | null;
          id?: string;
          name?: string;
          xp?: number;
        };
        Relationships: [];
      };
      BHPlayerAlias: {
        Row: {
          alias: string;
          createdAt: string;
          playerId: string;
          public: boolean;
        };
        Insert: {
          alias: string;
          createdAt?: string;
          playerId: string;
          public?: boolean;
        };
        Update: {
          alias?: string;
          createdAt?: string;
          playerId?: string;
          public?: boolean;
        };
        Relationships: [];
      };
      BHPlayerData: {
        Row: {
          damageDealt: number;
          damageGadgets: number;
          damageTaken: number;
          damageThrownItem: number;
          damageUnarmed: number;
          falls: number;
          games: number;
          id: string;
          koGadgets: number;
          kos: number;
          koThrownItem: number;
          koUnarmed: number;
          lastUpdated: string;
          level: number;
          matchTime: number;
          matchTimeUnarmed: number;
          name: string;
          peakRating: number;
          rankedGames: number;
          rankedWins: number;
          rating: number;
          region: string;
          suicides: number;
          teamKos: number;
          tier: string;
          wins: number;
          xp: number;
        };
        Insert: {
          damageDealt: number;
          damageGadgets: number;
          damageTaken: number;
          damageThrownItem: number;
          damageUnarmed: number;
          falls: number;
          games: number;
          id: string;
          koGadgets: number;
          kos: number;
          koThrownItem: number;
          koUnarmed: number;
          lastUpdated: string;
          level: number;
          matchTime: number;
          matchTimeUnarmed: number;
          name: string;
          peakRating: number;
          rankedGames: number;
          rankedWins: number;
          rating: number;
          region: string;
          suicides: number;
          teamKos: number;
          tier: string;
          wins: number;
          xp: number;
        };
        Update: {
          damageDealt?: number;
          damageGadgets?: number;
          damageTaken?: number;
          damageThrownItem?: number;
          damageUnarmed?: number;
          falls?: number;
          games?: number;
          id?: string;
          koGadgets?: number;
          kos?: number;
          koThrownItem?: number;
          koUnarmed?: number;
          lastUpdated?: string;
          level?: number;
          matchTime?: number;
          matchTimeUnarmed?: number;
          name?: string;
          peakRating?: number;
          rankedGames?: number;
          rankedWins?: number;
          rating?: number;
          region?: string;
          suicides?: number;
          teamKos?: number;
          tier?: string;
          wins?: number;
          xp?: number;
        };
        Relationships: [];
      };
      BHPlayerLegend: {
        Row: {
          damageDealt: number;
          damageGadgets: number;
          damageTaken: number;
          damageThrownItem: number;
          damageUnarmed: number;
          damageWeaponOne: number;
          damageWeaponTwo: number;
          falls: number;
          games: number;
          koGadgets: number;
          kos: number;
          koThrownItem: number;
          koUnarmed: number;
          koWeaponOne: number;
          koWeaponTwo: number;
          lastUpdated: string;
          legend_id: number;
          level: number;
          matchTime: number;
          player_id: string;
          suicides: number;
          teamKos: number;
          timeHeldWeaponOne: number;
          timeHeldWeaponTwo: number;
          wins: number;
          xp: number;
        };
        Insert: {
          damageDealt: number;
          damageGadgets: number;
          damageTaken: number;
          damageThrownItem: number;
          damageUnarmed: number;
          damageWeaponOne: number;
          damageWeaponTwo: number;
          falls: number;
          games: number;
          koGadgets: number;
          kos: number;
          koThrownItem: number;
          koUnarmed: number;
          koWeaponOne: number;
          koWeaponTwo: number;
          lastUpdated: string;
          legend_id: number;
          level: number;
          matchTime: number;
          player_id: string;
          suicides: number;
          teamKos: number;
          timeHeldWeaponOne: number;
          timeHeldWeaponTwo: number;
          wins: number;
          xp: number;
        };
        Update: {
          damageDealt?: number;
          damageGadgets?: number;
          damageTaken?: number;
          damageThrownItem?: number;
          damageUnarmed?: number;
          damageWeaponOne?: number;
          damageWeaponTwo?: number;
          falls?: number;
          games?: number;
          koGadgets?: number;
          kos?: number;
          koThrownItem?: number;
          koUnarmed?: number;
          koWeaponOne?: number;
          koWeaponTwo?: number;
          lastUpdated?: string;
          legend_id?: number;
          level?: number;
          matchTime?: number;
          player_id?: string;
          suicides?: number;
          teamKos?: number;
          timeHeldWeaponOne?: number;
          timeHeldWeaponTwo?: number;
          wins?: number;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'BHPlayerLegend_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'BHPlayerData';
            referencedColumns: ['id'];
          },
        ];
      };
      BHPlayerWeapon: {
        Row: {
          damageDealt: number;
          games: number;
          kos: number;
          lastUpdated: string;
          level: number;
          matchTime: number;
          player_id: string;
          weapon_name: string;
          wins: number;
          xp: number;
        };
        Insert: {
          damageDealt: number;
          games: number;
          kos: number;
          lastUpdated: string;
          level: number;
          matchTime: number;
          player_id: string;
          weapon_name: string;
          wins: number;
          xp: number;
        };
        Update: {
          damageDealt?: number;
          games?: number;
          kos?: number;
          lastUpdated?: string;
          level?: number;
          matchTime?: number;
          player_id?: string;
          weapon_name?: string;
          wins?: number;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'BHPlayerWeapon_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'BHPlayerData';
            referencedColumns: ['id'];
          },
        ];
      };
      CrawlProgress: {
        Row: {
          id: string;
          lastUpdated: string;
          name: string;
          progress: number;
        };
        Insert: {
          id: string;
          lastUpdated: string;
          name: string;
          progress: number;
        };
        Update: {
          id?: string;
          lastUpdated?: string;
          name?: string;
          progress?: number;
        };
        Relationships: [];
      };
      UserConnection: {
        Row: {
          appId: string;
          name: string;
          public: boolean;
          type: string;
          userId: string;
          verified: boolean;
        };
        Insert: {
          appId: string;
          name: string;
          public?: boolean;
          type: string;
          userId: string;
          verified: boolean;
        };
        Update: {
          appId?: string;
          name?: string;
          public?: boolean;
          type?: string;
          userId?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'UserConnection_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'UserProfile';
            referencedColumns: ['id'];
          },
        ];
      };
      UserFavorite: {
        Row: {
          id: string;
          meta: Json;
          name: string;
          type: string;
          userId: string;
        };
        Insert: {
          id: string;
          meta: Json;
          name: string;
          type: string;
          userId: string;
        };
        Update: {
          id?: string;
          meta?: Json;
          name?: string;
          type?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserFavorite_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'UserProfile';
            referencedColumns: ['id'];
          },
        ];
      };
      UserProfile: {
        Row: {
          avatarUrl: string;
          id: string;
          username: string;
        };
        Insert: {
          avatarUrl?: string;
          id: string;
          username?: string;
        };
        Update: {
          avatarUrl?: string;
          id?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      gtrgm_compress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: {
          '': unknown;
        };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      search_aliases: {
        Args: {
          search: string;
          aliases_offset: number;
          aliases_per_page: number;
        };
        Returns: {
          alias: string;
          createdAt: string;
          playerId: string;
          public: boolean;
        }[];
      };
      set_limit: {
        Args: {
          '': number;
        };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: {
          '': string;
        };
        Returns: string[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
