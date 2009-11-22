require 'rubygems'
require 'rake'

desc "Migrate database"
task :auto_migrate do
  require 'app'
  DataMapper.auto_migrate!
end

desc "Upgrade database"
task :auto_upgrade do
  require 'app'
  DataMapper.auto_upgrade!
end

# task :default => :test
