// Database column existence check for checkbox fields
const { createClient } = require('@supabase/supabase-js');

// Environment variables (you need to set these)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

async function checkDatabaseColumns() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('🔍 データベース列の存在確認...');
    
    // Check if the checkbox columns exist
    const { data, error } = await supabase
      .from('prediction_logs')
      .select('current_weight_verified, mother_weight_verified, father_weight_verified')
      .limit(1);
    
    if (error) {
      console.error('❌ カラム確認エラー:', error.message);
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️ チェックボックス用のカラムが存在しません。以下のSQLを実行してください:');
        console.log('');
        console.log('ALTER TABLE prediction_logs');
        console.log('ADD COLUMN IF NOT EXISTS current_weight_verified BOOLEAN DEFAULT false,');
        console.log('ADD COLUMN IF NOT EXISTS mother_weight_verified BOOLEAN DEFAULT false,');
        console.log('ADD COLUMN IF NOT EXISTS father_weight_verified BOOLEAN DEFAULT false;');
        console.log('');
      }
      
      return false;
    }
    
    console.log('✅ チェックボックス用カラムが存在します');
    console.log('📊 取得したデータ:', data);
    return true;
    
  } catch (err) {
    console.error('❌ データベース接続エラー:', err);
    return false;
  }
}

async function testCheckboxInsert() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('🧪 チェックボックス値のテスト挿入...');
    
    const testData = {
      line_user_id: 'test-checkbox-user',
      display_name: 'Test User',
      purchase_source: 'petshop',
      has_purchase_experience: 'yes',
      breed: 'test breed',
      gender: 'male',
      birth_date: '2024-01-01',
      current_weight: 1.0,
      current_weight_verified: true,
      mother_weight_verified: false,
      father_weight_verified: true
    };
    
    const { data, error } = await supabase
      .from('prediction_logs')
      .insert(testData)
      .select('id, current_weight_verified, mother_weight_verified, father_weight_verified')
      .single();
    
    if (error) {
      console.error('❌ テスト挿入エラー:', error);
      return false;
    }
    
    console.log('✅ テスト挿入成功:', data);
    
    // Clean up test data
    await supabase
      .from('prediction_logs')
      .delete()
      .eq('id', data.id);
    
    console.log('🧹 テストデータを削除しました');
    return true;
    
  } catch (err) {
    console.error('❌ テスト挿入エラー:', err);
    return false;
  }
}

// Main execution
(async () => {
  console.log('=== チェックボックス用データベースのデバッグ ===');
  
  const columnsExist = await checkDatabaseColumns();
  
  if (columnsExist) {
    await testCheckboxInsert();
  }
  
  console.log('=== デバッグ完了 ===');
})();